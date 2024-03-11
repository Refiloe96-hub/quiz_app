//selecting all required elements
const start_btn = document.querySelector(".start_btn button");
const info_box = document.querySelector(".info_box");
const exit_btn = info_box.querySelector(".buttons .quit");
const continue_btn = info_box.querySelector(".buttons .restart");
const quiz_box = document.querySelector(".quiz_box");
const result_box = document.querySelector(".result_box");
const option_list = document.querySelector(".option_list");
const time_line = document.querySelector("header .time_line");
const timeText = document.querySelector(".timer .time_left_txt");
const timeCount = document.querySelector(".timer .timer_sec");

// if startQuiz button clicked
start_btn.onclick = () => {
    info_box.classList.add("activeInfo"); //show info box
}

// if exitQuiz button clicked
exit_btn.onclick = () => {
    info_box.classList.remove("activeInfo"); //hide info box
}

// if continueQuiz button clicked
continue_btn.onclick = () => {
    info_box.classList.remove("activeInfo"); //hide info box
    quiz_box.classList.add("activeQuiz"); //show quiz box
    showQuetions(0); //calling showQestions function
    queCounter(1); //passing 1 parameter to queCounter
    startTimer(15); //calling startTimer function
    startTimerLine(0); //calling startTimerLine function
}

let timeValue = 15;
let que_count = 0;
let que_numb = 1;
let userScore = 0;
let counter;
let counterLine;
let widthValue = 0;

const restart_quiz = result_box.querySelector(".buttons .restart");
const quit_quiz = result_box.querySelector(".buttons .quit");

// if restartQuiz button clicked
restart_quiz.onclick = () => {
    quiz_box.classList.add("activeQuiz"); //show quiz box
    result_box.classList.remove("activeResult"); //hide result box
    timeValue = 15;
    que_count = 0;
    que_numb = 1;
    userScore = 0;
    widthValue = 0;
    showQuetions(que_count); //calling showQestions function
    queCounter(que_numb); //passing que_numb value to queCounter
    clearInterval(counter); //clear counter
    clearInterval(counterLine); //clear counterLine
    startTimer(timeValue); //calling startTimer function
    startTimerLine(widthValue); //calling startTimerLine function
    timeText.textContent = "Time Left"; //change the text of timeText to Time Left
    next_btn.classList.remove("show"); //hide the next button
}

// if quitQuiz button clicked
quit_quiz.onclick = () => {
    window.location.reload(); //reload the current window
}

const next_btn = document.querySelector("footer .next_btn");
const bottom_ques_counter = document.querySelector("footer .total_que");

// if Next Que button clicked
next_btn.onclick = () => {
    if (que_count < questions.length - 1) { //if question count is less than total question length
        que_count++; //increment the que_count value
        que_numb++; //increment the que_numb value
        showQuetions(que_count); //calling showQestions function
        queCounter(que_numb); //passing que_numb value to queCounter
        clearInterval(counter); //clear counter
        clearInterval(counterLine); //clear counterLine
        startTimer(timeValue); //calling startTimer function
        startTimerLine(widthValue); //calling startTimerLine function
        timeText.textContent = "Time Left"; //change the timeText to Time Left
        next_btn.classList.remove("show"); //hide the next button
    } else {
        clearInterval(counter); //clear counter
        clearInterval(counterLine); //clear counterLine
        showResult(); //calling showResult function
    }
}

// getting questions and options from array
function showQuetions(index) {
    const que_text = document.querySelector(".que_text");

    //creating a new span and div tag for question and option and passing the value using array index
    let que_tag = '<span>' + questions[index].numb + ". " + questions[index].question + '</span>';
    let option_tag = '<div class="option"><span>' + questions[index].options[0] + '</span></div>'
        + '<div class="option"><span>' + questions[index].options[1] + '</span></div>'
        + '<div class="option"><span>' + questions[index].options[2] + '</span></div>'
        + '<div class="option"><span>' + questions[index].options[3] + '</span></div>';
    que_text.innerHTML = que_tag; //adding new span tag inside que_tag
    option_list.innerHTML = option_tag; //adding new div tag inside option_tag

    const option = option_list.querySelectorAll(".option");

    // set onclick attribute to all available options
    for (i = 0; i < option.length; i++) {
        option[i].setAttribute("onclick", "optionSelected(this)");
    }
}
// creating the new div tags which for icons
let tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
let crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

//if user clicked on option
function optionSelected(answer) {
    clearInterval(counter); //clear counter
    clearInterval(counterLine); //clear counterLine
    let userAns = answer.textContent; //getting user selected option
    let correcAns = questions[que_count].answer; //getting correct answer from array
    const allOptions = option_list.children.length; //getting all option items

    if (userAns == correcAns) { //if user selected option is equal to array's correct answer
        userScore += 1; //upgrading score value with 1
        answer.classList.add("correct"); //adding green color to correct selected option
        answer.insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to correct selected option
        console.log("Correct Answer");
        console.log("Your correct answers = " + userScore);
    } else {
        answer.classList.add("incorrect"); //adding red color to correct selected option
        answer.insertAdjacentHTML("beforeend", crossIconTag); //adding cross icon to correct selected option
        console.log("Wrong Answer");

        for (i = 0; i < allOptions; i++) {
            if (option_list.children[i].textContent == correcAns) { //if there is an option which is matched to an array answer 
                option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
                option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to matched option
                console.log("Auto selected correct answer.");
            }
        }
    }
    for (i = 0; i < allOptions; i++) {
        option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
    }
    next_btn.classList.add("show"); //show the next button if user selected any option
}

function showResult() {
    info_box.classList.remove("activeInfo"); //hide info box
    quiz_box.classList.remove("activeQuiz"); //hide quiz box
    result_box.classList.add("activeResult"); //show result box
    const scoreText = result_box.querySelector(".score_text");
    if (userScore > 3) { // if user scored more than 3
        //creating a new span tag and passing the user score number and total question number
        let scoreTag = '<span>and congrats! 🎉, You got <p>' + userScore + '</p> out of <p>' + questions.length + '</p></span>';
        scoreText.innerHTML = scoreTag;  //adding new span tag inside score_Text
    }
    else if (userScore > 1) { // if user scored more than 1
        let scoreTag = '<span>and nice 😎, You got <p>' + userScore + '</p> out of <p>' + questions.length + '</p></span>';
        scoreText.innerHTML = scoreTag;
    }
    else { // if user scored less than 1
        let scoreTag = '<span>and sorry 😐, You got only <p>' + userScore + '</p> out of <p>' + questions.length + '</p></span>';
        scoreText.innerHTML = scoreTag;
    }
}

function startTimer(time) {
    counter = setInterval(timer, 1000);
    function timer() {
        timeCount.textContent = time; //changing the value of timeCount with time value
        time--; //decrement the time value
        if (time < 9) { //if timer is less than 9
            let addZero = timeCount.textContent;
            timeCount.textContent = "0" + addZero; //add a 0 before time value
        }
        if (time < 0) { //if timer is less than 0
            clearInterval(counter); //clear counter
            timeText.textContent = "Time Off"; //change the time text to time off
            const allOptions = option_list.children.length; //getting all option items
            let correcAns = questions[que_count].answer; //getting correct answer from array
            for (i = 0; i < allOptions; i++) {
                if (option_list.children[i].textContent == correcAns) { //if there is an option which is matched to an array answer
                    option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
                    option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to matched option
                    console.log("Time Off: Auto selected correct answer.");
                }
            }
            for (i = 0; i < allOptions; i++) {
                option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
            }
            next_btn.classList.add("show"); //show the next button if user selected any option
        }
    }
}

function startTimerLine(time) {
    counterLine = setInterval(timer, 29);
    function timer() {
        time += 1; //upgrading time value with 1
        time_line.style.width = time + "px"; //increasing width of time_line with px by time value
        if (time > 549) { //if time value is greater than 549
            clearInterval(counterLine); //clear counterLine
        }
    }
}

function queCounter(index) {
    //creating a new span tag and passing the question number and total question
    let totalQueCounTag = '<span><p>' + index + '</p> of <p>' + questions.length + '</p> Questions</span>';
    bottom_ques_counter.innerHTML = totalQueCounTag;  //adding new span tag inside bottom_ques_counter
}

function loadApp(appPath) {
    fetch(appPath)
        .then(response => response.text())
        .then(data => {
            document.getElementById('appContent').innerHTML = data;
        })
        .catch(err => console.error(err));
}

document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.sidebar a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove 'active' class from all links and add to the clicked one
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            // Dynamically load content
            loadContent(this.getAttribute('href'));
        });
    });
});

// Function to dynamically load content with a fade-in effect
function loadContent(url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const appContent = document.getElementById('appContent');
            appContent.innerHTML = html;
            // Initially set opacity to 0 and then fade in
            appContent.style.opacity = 0;
            setTimeout(() => {
                appContent.style.opacity = 1;
                appContent.style.transition = 'opacity 0.5s ease-in-out';
            }, 10);
        })
        .catch(err => console.error('Failed to load page:', err));
}

// AFTER THE CARD DESIGN
// Function to toggle the sidebar with a smooth animation effect
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    // Adding a smooth transition effect for the sidebar
    sidebar.style.transition = 'all 0.5s ease';
}

// Function to add interactive animations to quiz options
function animateQuizOptions() {
    const options = document.querySelectorAll('.quiz_box .option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            option.classList.add('selected');
            // Adding a 'pulse' animation for the selected option
            option.style.animation = 'pulse 0.5s ease';
        });
    });
}

// Function to enhance button interactions with responsive feedback
function enhanceButtonInteractions() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            // Scale effect on hover
            button.style.transform = 'scale(1.05)';
            button.style.transition = 'transform 0.1s ease';
        });
        button.addEventListener('mouseout', () => {
            // Revert to original scale when not hovered
            button.style.transform = 'scale(1)';
        });
    });
}

// Function to update the quiz progress indicator
function updateQuizProgress() {
    const progressBar = document.querySelector('.quiz-progress-bar');
    // Assuming que_numb is your current question index
    const currentQuestionNumber = que_numb;
    const totalQuestions = questions.length;
    // Calculate the progress percentage
    const progressPercentage = (currentQuestionNumber / totalQuestions) * 100;
    // Update the width of the progress bar to reflect the current progress
    progressBar.style.width = progressPercentage + '%';
}

// Initialize enhancements when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Call the function to enhance button interactions
    enhanceButtonInteractions();
    // You can place additional initialization code here as needed
});

document.addEventListener('DOMContentLoaded', () => {
    // Enables the sidebar toggle functionality on mobile devices
    const sidebarToggle = document.getElementById('sidebar-toggle');
    sidebarToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    // Loads dashboard data and updates the UI dynamically
    function loadDashboardData() {
        // Simulate a network call with a timeout
        setTimeout(() => {
            document.querySelector('.card-value.quizzes').textContent = '34';
            document.querySelector('.card-value.graphs').textContent = '12';
            document.querySelector('.card-value.summaries').textContent = '27';
        }, 1000);
    }

    // Invokes the dashboard data loading function
    loadDashboardData();

    // Attaches click event listeners to card details for future features
    document.querySelectorAll('.card-detail').forEach(detail => {
        detail.addEventListener('click', () => {
            // Placeholder logic for future feature expansion
            alert('Feature coming soon!');
        });
    });

    // Function to load and display the latest activity log entries
    function loadActivityLog() {
        const activities = [
            "User 'JaneDoe92' completed 'Advanced Math Quiz'",
            "User 'Mark47' created a new knowledge graph",
            // Additional activities could be fetched and added here
        ];

        const activityList = document.querySelector('.activity-list');
        activityList.innerHTML = ''; // Clears the current list

        // Creates and appends a list item for each new activity
        activities.forEach(activity => {
            const listItem = document.createElement('li');
            listItem.textContent = activity;
            activityList.appendChild(listItem);
        });
    }

    // Populates the activity log on page load
    loadActivityLog();

    // Implements smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            event.preventDefault();
            const targetId = anchor.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Back to top button functionality
    const backToTopButton = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            backToTopButton.classList.add('shown');
        } else {
            backToTopButton.classList.remove('shown');
        }
    });

    // Scrolls to the top of the page when the button is clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Uncomment and implement the fetchData function when ready to fetch data from an API
    /*
    async function fetchData(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        // Process and display data here...
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    */
});


// DATABASE

