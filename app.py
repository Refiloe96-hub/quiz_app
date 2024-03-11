from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from datetime import datetime

import spacy
import networkx as nx
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd
from collections import Counter
import re

from transformers import pipeline
classifier = pipeline("zero-shot-classification", model="typeform/distilbert-base-uncased-mnli")

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///knowledge_graphs2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # It's a good practice to disable this if you don't need it
db = SQLAlchemy(app)

# Define a model for KnowledgeGraph
class KnowledgeGraph(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.Text, nullable=False)
    topic = db.Column(db.String(255))  # Add this line for the topic column
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<KnowledgeGraph {self.id}>'

# Create the database and tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/knowledge_graph')
def knowledge_graph():
    # Retrieve all knowledge graphs ordered by creation date
    graphs = KnowledgeGraph.query.order_by(KnowledgeGraph.created_at.desc()).all()
    return render_template('knowledge_graph.html', graphs=graphs)

@app.route('/summarization')
def summarization():
    return render_template('summarization.html')

# Load SpaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Preprocess text to remove citations
def preprocess_text(text):
    # Remove patterns like [2], [3], etc.
    text = re.sub(r'\[\d+\]', '', text)
    return text

def generate_graph(text):
    G = nx.Graph()
    doc = nlp(text)

    # Add nodes for important words (nouns, verbs, adjectives, proper nouns)
    for token in doc:
        if (not token.is_stop and not token.is_punct and not token.like_num and not token.is_space and
            token.pos_ in ['NOUN', 'PROPN', 'VERB', 'ADJ']):
            G.add_node(token.lemma_, pos=token.pos_)

    # Add edges based on syntactic dependencies and semantic relationships
    for token in doc:
        if token.head != token and token.head.lemma_ in G and token.lemma_ in G:
            G.add_edge(token.head.lemma_, token.lemma_)

        if token.pos_ == 'ADJ' and token.dep_ == 'amod' and token.head.lemma_ in G:
            G.add_edge(token.lemma_, token.head.lemma_)

    # Cluster analysis as in your original code
    if len(G) == 0:
        return G

    df = pd.DataFrame(nx.adjacency_matrix(G).todense(), index=G.nodes(), columns=G.nodes())
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df)
    kmeans = KMeans(n_clusters=3, n_init=10, random_state=42)
    kmeans.fit(X_scaled)

    cluster_sizes = Counter(kmeans.labels_)
    sorted_clusters = sorted(cluster_sizes, key=cluster_sizes.get, reverse=True)
    cluster_rank = {cluster: rank for rank, cluster in enumerate(sorted_clusters, start=1)}

    for node in G.nodes():
        G.nodes[node]['cluster_rank'] = cluster_rank[kmeans.labels_[df.index.get_loc(node)]]

    return G

@app.route('/graph-data', methods=['POST'])
def graph_data():
    text = request.form.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided.'}), 400

    try:
        # Preprocess the text to remove references
        cleaned_text = preprocess_text(text)
        G = generate_graph(cleaned_text)
        if len(G) == 0:
            return jsonify({'error': 'The provided text did not generate any graph elements.'}), 400

        data = {
            'nodes': [{'id': node, 'group': G.nodes[node].get('cluster_rank', 0)} for node in G.nodes()],
            'links': [{'source': u, 'target': v} for u, v in G.edges()]
        }

        # Here we are directly saving the graph data to the database.
        # You can uncomment the following lines to save the data.
        new_graph = KnowledgeGraph(data=str(data))  # Convert data to string if needed
        db.session.add(new_graph)
        db.session.commit()

        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to save a new knowledge graph
# Assuming you have an endpoint to save the graph manually after generation
@app.route('/save_graph', methods=['POST'])
def save_graph():
    try:
        content = request.json
        if not content or 'data' not in content or 'topic' not in content:
            return jsonify({'error': 'Missing data or topic in the request'}), 400

        graph_data = content['data']
        graph_topic = content['topic']

        # Check if the topic is already in the database
        existing_graph = KnowledgeGraph.query.filter_by(topic=graph_topic).first()
        if existing_graph:
            return jsonify({'error': 'Graph with this topic already exists.'}), 400

        new_graph = KnowledgeGraph(data=str(graph_data), topic=graph_topic)
        db.session.add(new_graph)
        db.session.commit()
        return jsonify({'id': new_graph.id, 'topic': new_graph.topic}), 201
    except Exception as e:
        # Log the exception for debugging
        print(f"Error: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

# Route to retrieve a specific knowledge graph by ID
@app.route('/api/graphs')
def get_graphs():
    graphs = KnowledgeGraph.query.order_by(KnowledgeGraph.created_at.desc()).all()
    graph_list = [{'id': graph.id, 'data': graph.data, 'created_at': graph.created_at.isoformat()} for graph in graphs]
    return jsonify(graph_list)

@app.route('/identify-topic', methods=['POST'])
def identify_topic():
    text = request.json['text']
    # Define some candidate topics (you can modify these to fit your application's context)
    candidate_topics = ["sports", "politics", "technology", "entertainment", "health", "economy"]

    # Use the model to classify the text into one of the topics
    result = classifier(text, candidate_topics)
    topic = result['labels'][0]  # Assuming the first label is the most relevant

    return jsonify({"topic": topic})

if __name__ == '__main__':
    app.run(debug=True)
