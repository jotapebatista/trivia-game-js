import "./style.css";

const BASE_URL = "https://opentdb.com/";

$(document).ready(function () {
  $("#btn-fetch").on("click", fetchQuestions);
  fetchCategories();
});

function fetchCategories() {
  fetch(BASE_URL + "api_category.php")
    .then((response) => {
      if (response.status !== 200) {
        console.error("There was a problem! Status code: " + response.status);
        return;
      }
      return response.json();
    })
    .then((data) => {
      data.trivia_categories.forEach((element) => {
        let triviaCategories = `<option data-key="${element.id}">${element.name}</option>`;
        $("#categories-selector").removeAttr("hidden").append(triviaCategories);
      });
    });
}

function fetchQuestions() {
  let selectedOption = $("#categories-selector").find(":selected");
  let dataKey = selectedOption.data("key");

  fetch(`${BASE_URL}api.php?amount=10&category=${dataKey}&difficulty=easy`)
    .then((response) => {
      if (response.status !== 200) {
        console.error("There was a problem! Status code: " + response.status);
        return;
      }
      return response.json();
    })
    .then((data) => {
      displayQuestions(data.results);
    });
}

function displayQuestions(questions) {
  let currentIndex = 0;
  let correctAnswers = 0;
  let points = 0;
  let gameFrame = $("#game-frame");
  $("#start-frame").toggle();

  function displayQuestion(index) {
    if (index < questions.length) {
      let element = questions[index];
      console.log(questions[index]);
      if (element.type === "multiple") {
        let options = [...element.incorrect_answers, element.correct_answer];
        options = shuffleArray(options);

        let optionsHTML = options
          .map(
            (option, idx) =>
              `<button class="option-button" data-option="${option}">${option}</button>`
          )
          .join("");

        gameFrame.html(`
                    <h1>${element.category}</h1>
                    <h3>#${currentIndex + 1} of ${questions.length}</h3>
                    <p>${element.question}</p>
                    ${optionsHTML}
                    <p class="score-points">Score: ${points}</p>
                `);

        $(".option-button").on("click", function () {
          let selectedOption = $(this).data("option");

          if (selectedOption === element.correct_answer) {
            correctAnswers++;
            points += 10;
            $("#feedback")
              .text("CORRECT")
              .removeClass("wrong")
              .addClass("correct");
          } else {
            $("#feedback")
              .text("WRONG")
              .removeClass("correct")
              .addClass("wrong");
          }

          showFeedback(element.correct_answer);

          setTimeout(() => {
            displayQuestion(++currentIndex);
          }, 1500);
        });
      } else {
        gameFrame.html(`
                <h1>${element.category}</h1>
                <h3>#${currentIndex + 1} of ${questions.length}</h3>
                <p>${element.question}</p>
                <button class="option-button" data-option="True">True</button>
                <button class="option-button" data-option="False">False</button>
                <p class="score-points">Score: ${points}</p>
                `);

        $(".option-button").on("click", function () {
          let selectedOption = $(this).data("option");

          if (selectedOption === element.correct_answer) {
            correctAnswers++;
            points += 10;
            $("#feedback")
              .text("CORRECT")
              .removeClass("wrong")
              .addClass("correct");
          } else {
            $("#feedback")
              .text("WRONG")
              .removeClass("correct")
              .addClass("wrong");
          }

          showFeedback(element.correct_answer);

          setTimeout(() => {
            displayQuestion(++currentIndex);
          }, 1500);
        });
      }
    } else {
      gameFrame.html(
        `<p>You got ${correctAnswers} questions right out of ${questions.length}! 🚀</p>
        <p>Total Points: ${points}</p>
        <button id="play-again">Play again</button>
        <button id="reset-button">Back to menu</button>`
      );
      $("#play-again").on("click", () => {
        location.reload();
      });
    }
  }

  displayQuestion(currentIndex);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showFeedback(correctAnswer) {
  $(".option-button").each(function () {
    let option = $(this);
    let selectedOption = option.data("option");

    option.off("click"); // Disable clicking during feedback

    if (selectedOption === correctAnswer) {
      option.addClass("correct");
    } else if (
      selectedOption !== correctAnswer &&
      selectedOption === selectedOption
    ) {
      option.addClass("wrong");
    }
  });
}
