"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  timerEnabled: boolean;
  numberOfQuestions: number;
};

const Quiz = (props: Props) => {
  //Set Amount Of Quiz Questions
  const quizLength = props.numberOfQuestions;

  //Really do appologize for all the use states,
  //I could have condensed this with useHook/useMemo/whatever
  //react hook can do multiple states but, I don't really know how

  //STATE FOR KEEPING ANSWERS
  const [currentCorrect, setCurrentCorrect] = useState(0);
  const [currentIncorrect, setCurrentIncorrect] = useState(0);

  //STATE FOR KEEPING WHAT THE CORRECT ANSWER(S) TO THE QUESTION IS/ARE
  const [correctAnswer, setCorrectAnswer] = useState<string[]>();

  //KEEP TRACK OF WHAT QUESTIONS HAVE ALREADY BEEN ANSWERED
  const [alreadyAnswered, setAlreadyAnswered] = useState<number[]>([]);

  //KEEP TRACK OF CURRENT QUESTION OBJECT IN STATE
  const [questionObject, setQuestionObject] = useState<any>();

  //KEEP TRACK OF HOW MANY ANSWERS THE QUESTION HAS, STYLE BUTTONS ACCORDINGLY
  const [correctAnswerNum, setCorrectAnswerNum] = useState(1);

  //KEEP TRACK OF WHAT QUESTION ID THE USER IS ANSWERING
  const [currentQuestionNum, setCurrentQuestionNum] = useState(0);

  //KEEP TRACK OF WHETHER OR NOT THIS QUESTION HAS BEEN SUBMITTED
  const [submitted, setSubmitted] = useState(false);

  //KEEP TRACK OF WHETHER OR NOT THE USER HAS SUBMITTED THE AMOUNT OF QUESTIONS SPECIFIED
  const [quizEnded, setQuizEnded] = useState(false);

  const [totalTime, setTotalTime] = useState(0);

  //STATE FOR KEEPING TRACK OF WHETHER OR NOT THE QUIZ ELEMENTS ALREADY
  //HAVE EVENT LISTENER ON THEM, ADDING IT TWICE WILL BREAK THE QUIZ
  const [choicesHaveEventListeners, setChoicesHaveEventListeners] =
    useState(false);

  //TIMER COUNTDOWN
  //KEEP TRACK OF CURRENT TIME
  const [currentTime, setCurrentTime] = useState(0);

  const timer = (initialTime?: number) => {
    // console.log(currentTime);
    //GET THE TIMER SPAN TO DISPLAY TEXT
    const timerSpan = document.getElementById("currentTime");
    //IF NO TIMER SPAN RETURN, THIS REALLY PROBABLY IS NOT THE BEST WAY TO DO
    //IN TYPESCRIPT BUT I NEED TO ENSURE THIS ELEMENT IS NOT NULL TO UPDATE IT
    if (!timerSpan) return;

    if (initialTime && initialTime != currentTime) setCurrentTime(initialTime);

    //IF THE CURRENT TIME IS 0 OR LESS
    if (currentTime <= 0) {
      //AUTO SUBMIT QUESTION
      submitQuestion();
      return;
    }

    if (!submitted) {
      //SET A TIMEOUT FOR 1s
      setTimeout(() => {
        if (submitted) {
          setCurrentTime(0);
          return;
        }
        //ELSE DECREMENT TIME
        let tempTime = currentTime;
        tempTime--;

        const currentTotalTime = totalTime + 1;
        // console.log(currentTotalTime);
        setTotalTime(currentTotalTime);

        //SET TIMER SPAN CONTENT TO THE CURRENT TIME
        timerSpan!.textContent = "- " + String(tempTime);

        //SET TIMER STATE
        setCurrentTime(tempTime);
      }, 1000);
    }
  };

  //SET NEW TIMER FOR SPECIFIED TIME + UPDATE IN DOM ELEMENT
  const setTimer = (time: number) => {
    //GET TIMER SPAN
    const timerSpan = document.getElementById("currentTime");
    //IF FOUND ITEM, SET TEXT CONTENT TO THE TIME PASSED
    if (timerSpan) timerSpan.textContent = "- " + String(time);
    //SET CURRENT TIME TO THE TIME
    setCurrentTime(time);
  };

  useEffect(() => {
    timer();
  }, [currentTime]);

  //FIRE EVENT WHEN THE GAME IS STARTING BECAUSE THIS ELEMENT IS
  //IN PAGE.TSX
  const handleClickIfStartGame = (e: MouseEvent) => {
    //GET TARGET OF MOUSE AS HTMLElement AND COMPARE THE ID, IF startBtn
    if ((e.target as HTMLElement).id === "startBtn") {
      //START THE GAME
      startGame();
    } else {
      //DO NOTHING
      return;
    }
  };

  //ADD ABOVE DECLARED EVENT LISTENER TO DOCUMENT
  useEffect(() => {
    //CHECK IF CLICK IS ON START GAME BTN
    document.addEventListener("click", handleClickIfStartGame);
  }, []);

  const [startingGame, setStartingGame] = useState(false);

  let starting = false;
  //ACTUALLY START THE GAME
  const startGame = () => {
    if (!startingGame) {
      setStartingGame(true);
      //CLEAR ALL INPUTS
      clearInput();

      //RESETTING STATE
      //SET THE CORRECT ANSWER(S) TO AN EMPTY ARRAY
      setCorrectAnswer([]);

      //SET THE AMOUNT OF CORRECT ANSWERS TO 1
      setCorrectAnswerNum(1);

      //SET THIS QUESTION SUBMITTED TO FALSE
      setSubmitted(false);

      //ADD EVENT LISTENERS TO THE H3 AND DIV ELEMENTS TO
      //TOGGLE CHECKBOXES ON CLICK
      addEventListenersForTextChoices();

      //GET A QUESTION
      getQuestion();
    }
  };

  //CLEARING INPUTS
  const clearInput = () => {
    //DISPLAY TIMER
    const timer = document.getElementById("gameTimer");
    if (timer) timer.hidden = false;

    //GET ALL INPUT CHECKBOXES/RADIO BUTTONS
    const choices = [
      document.getElementById("choice1") as HTMLInputElement | null,
      document.getElementById("choice2") as HTMLInputElement | null,
      document.getElementById("choice3") as HTMLInputElement | null,
      document.getElementById("choice4") as HTMLInputElement | null,
      document.getElementById("choice5") as HTMLInputElement | null,
    ];

    const choiceWraps = [
      document.getElementById("choice1Wrap")! as HTMLInputElement,
      document.getElementById("choice2Wrap")! as HTMLInputElement,
      document.getElementById("choice3Wrap")! as HTMLInputElement,
      document.getElementById("choice4Wrap")! as HTMLInputElement,
      document.getElementById("choice5Wrap")! as HTMLInputElement,
    ];

    for (let i = 0; i < choiceWraps.length; i++) {
      choiceWraps[i].setAttribute("data-correct-highlight", "");
    }

    //CORRECT/INCORRECT + EXPLINATION WRAPPER
    const correctIncorrect = document.getElementById(
      "questionExplinationWrapper"
    )! as HTMLElement;

    //IF EXISTS SET HIDDEN TO TRUE
    if (correctIncorrect) {
      correctIncorrect.classList.add("hidden");
    }

    //LOOP THROUGH ALL CHOICES
    for (let i = 0; i < choices.length; i++) {
      //SET THEIR CHECKED VALUE TO FALSE
      if (choices[i]) choices[i]!.checked = false;
    }
  };

  //GET A NEW QUESTION
  const getQuestion = () => {
    //FETCH FROM EXTERNAL FILE AS FS REQUESTS NEED TO BE HANDLED SERVER SIDE
    const question = fetch("./framework/", {
      //SET METHOD TO POST AS THIS REQUEST TAKES IN WHAT QUESTIONS HAVE
      //ALREADY BEEN ANSWERED TO GENERATE A NEW ID IF ALREADYANSWERED ARRAY
      //IS SHORTER THAN THE AMOUNT OF DEFINED QUESTIONS IN framework/questions.json
      method: "POST",
      body: JSON.stringify(alreadyAnswered),
    })
      //GET JSON RESULT
      .then((res) => res.json())
      //DESTRUCTURE OBJECT INTO ID AND QUESTION
      .then(({ id, question }) => {
        //GET THE QUESTION OBJECT, DEFINANTLY NOT NECESSARY I PROBABLY
        //COULD JUST PASS THIS DIRECTLY TO setQuizContents
        let questionObj = question;

        //STORE QUESTION OBJ IN STATE
        setQuestionObject(questionObj);

        //SET THE CURRENT QUESTION TO THE ID PASSED BACK CAST TO A NUMBER
        //IN CASE IT IS FOR SOME REASON A STRING
        setCurrentQuestionNum(Number(id));

        //SET QUIZ CONTENTS TO THE QUESTION
        setQuizContents(questionObj);
        setStartingGame(false);
      });
  };

  //SET QUIZ CONTENTS

  //I KNOW ANYS ARE BAD, I SHOULD'VE TYPED THIS OBJECT AND CREATED A SHEMA,
  //BUT THIS DOES WORK IF THE QUESTIONS IN QUESTIONS.JSON ARE STRUCTURED
  const setQuizContents = (questionObj: any) => {
    //GET QUESTION ELEMENT
    const questionEl = document.getElementById("question");

    setTimer(questionObj.time ? questionObj.time : 30);

    //SET QUESTION ELEMENTS INNER HTML TO WHAT THE QUESTION IS
    if (questionEl) {
      //Set local question html var to the state object
      let questionHtml = questionObj.question;

      //Get seperate lines
      const lines = questionHtml.split("\n");
      //If there is more than 1 line
      if (lines.length > 1) {
        //Set the question HTML to be blank
        questionHtml = "";
        //For each line, element, add the line back into the HTML + a break element
        for (let i = 0; i < lines.length; i++) {
          if (i != lines.length - 1) {
            questionHtml += `${lines[i]}<br />`;
          } else {
            questionHtml += `${lines[i]}`;
          }
        }
      }

      //Get tabs
      const tabs = questionHtml.split("\t");
      //If there is more than 1 line
      if (tabs.length > 1) {
        //Set the question HTML to be blank
        questionHtml = "";
        //For each split, if position is zero
        for (let i = 0; i < tabs.length; i++) {
          if (i == 0 && tabs[i] != "") {
            questionHtml += tabs[i];
          } else {
            questionHtml += `<span class='tab'></span>${tabs[i]}`;
          }
        }
      }

      //Get code segments
      //Firstly split the question anywhere there is ```
      const codeSegments = questionHtml.split("```");

      //NOW THE ISSUE IS WE HAVE NO IDEA WHICH OF THESE ARRAY ELEMENTS IS THE CODE BLOCK
      //THIS LOGIC SOLVES THIS

      //Create array for saving parsed code blocks
      let parsedCodeBlocks = Array<string>();

      //If the segments length is more than 1 (there was a split)
      if (codeSegments.length > 1) {
        //Create a for loop that will go through the questionHTML character by character
        for (let i = 0; i < questionHtml.length; i++) {
          //Create a current index at i
          let currentIndex = i;
          //Get the first index of where ``` starts from the currentIndex (i)
          const index = Number(questionHtml.indexOf("```", currentIndex));

          //Get the next index after the first index, start from the index found + 3
          //because tag is a three character string
          const nextIndex = Number(questionHtml.indexOf("```", index + 3));

          //If one of these indexes is null or -1, means there is not another element,
          //Ideally index not nextIndex should be -1 because if nextIndex is -1 that
          //indicates no closing ```, however there is no error handling/checking of that
          //here, it is assumed the questions are written correctly
          if (!nextIndex || nextIndex == -1 || !index || index == -1) {
            //Just break out of this for loop, continue on with the rest of this
            //setQuizContents function
            break;
          } else {
            parsedCodeBlocks.push(
              questionHtml.substr(index + 3, nextIndex - index - 3)
            );

            //Set the i for the next loop call to the next index + 2 BECAUSE
            //i will ALSO BE INCREMENTED BY FOR LOOP after this finishes,
            //it is + 3 characters to correctly parse 2 code blocks back to back,
            //but the for loop adds 1 as well
            i = nextIndex + 2;
          }
        }
      }
      // Only if multiple codeSegments
      if (codeSegments.length > 1) {
        //Set question HTML to nothing
        questionHtml = "";

        //Loop through all the code segments, they are strings
        codeSegments.forEach((val: String) => {
          //Create a flag to keep track of whether or not the codeSegment is a codeSegment
          let flag = false;

          //If there is a value at that location
          if (val) {
            //Loop through all parsedCodeBlocks
            parsedCodeBlocks.forEach((parsedVal: String) => {
              //If they're the same
              if (val == parsedVal) {
                flag = true;
              }
            });

            if (!flag) {
              questionHtml += val;
            } else {
              questionHtml += `<span class="codeBlock">${val}</span>`;
            }
          }
        });
      }

      // console.log(JSON.stringify(questionHtml));
      questionEl.innerHTML = questionHtml;

      const codeContainer = document.querySelector(
        ".codeBlock"
      ) as HTMLElement | null;

      if (codeContainer) {
        const codeContainerContents = codeContainer.innerHTML.split("<br>");
        codeContainer.innerHTML = "";

        for (let i = 0; i < codeContainerContents.length; i++) {
          if (questionObj.codeBlockLineStartNum) {
            codeContainer.innerHTML += `<span class="line" lineNum=${
              i + questionObj.codeBlockLineStartNum
            }>${codeContainerContents[i]}</span><br>`;
          } else {
            codeContainer.innerHTML += `<span class="line" lineNum=${i + 1}>${
              codeContainerContents[i]
            }</span><br>`;
          }
        }
      }
    }

    //CREATE AN LOCAL ARRAY TO STORE WHAT THE CORRECT ANSWER(S) ARE
    let correctAnswer = [];

    //IF THE CORRECT ANSWER IS AN ARRAY
    if (typeof questionObj.correctAnswer !== "string") {
      //LOOP THROUGH THE ARRAY
      for (let i = 0; i < questionObj.correctAnswer.length; i++) {
        //ADD EACH ANSWER TO THE ARRAY
        correctAnswer.push(questionObj.correctAnswer[i]);
      }
    } else {
      //ADD THE ANSWER TO THE ARRAY
      correctAnswer.push(questionObj.correctAnswer);
    }

    //SET NUMBER OF CORRECT ANSWERS TO UPDATE WHETHER OR NOT
    //THE BOXES ARE RADIOS/CHECKBOXES
    setCorrectAnswerNum(correctAnswer.length);

    //SET THE CORRECT ANSWER(S) STATE TO THE CORRECT ANSWER ARRAY
    setCorrectAnswer(correctAnswer);

    //CHANGE ALL OF THE CHOICES, LOOP THROUGH ALL ANSWERS
    for (let i = 0; i < questionObj.answers.length; i++) {
      //CONSTRUCT ID TO SELECT WHAT OBJECT TO MODIFY
      const id = `choice${i + 1}Wrap`;

      //GET OBJECT WITH ID choice1Wrap, choice2Wrap, etc
      const choiceEl = document.getElementById(id);

      //IF THE ELEMENT EXISTS, SET SECOND CHILD (LABEL)
      //TO THE ANSWER TEXT AT [i]
      if (choiceEl) choiceEl.children[1].innerHTML = questionObj.answers[i];
    }
  };

  //SUBMIT QUESTION
  const submitQuestion = () => {
    //SET STATE TO DISABLE CHOICES
    setSubmitted(true);
    setCurrentTime(0);

    //GET ALL THE QUESTIONS THE USER HAS ANSWERED ALREADY AND
    //STORE THEM LOCALLY
    let currentAnswered = alreadyAnswered;

    //IF THERE IS A VALUE
    if (currentAnswered) {
      //PUSH THE CURRENT QUESTION TO THE ARRAY
      currentAnswered.push(currentQuestionNum);
    } else {
      //IF NO VALUE, SET CURRENTANSWERED TO NEW ARRAY
      currentAnswered = [];

      //PUSH THE CURRENT QUESTION TO THE ARRAY
      currentAnswered.push(currentQuestionNum);
    }

    //SET THE ALREADY ANSWERED QUESTIONS STATE TO THE LOCAL ARRAY
    setAlreadyAnswered(currentAnswered);

    //GET ALL THE CHOICE CHECKBOXES IN A BIG ARRAY, ! CAN BE USED
    //HERE BUT I'M SURE THERE IS A BETTER WAY, THE REASON IT CAN
    //BE USED THOUGH IS WE KNOW WHEN THIS FUNCTION GETS CALLED IT'S
    //ON CLICK OF A FORM BUTTON, THESE ELEMENTS WILL EXIST IN THE
    //DOCUMENT UNLESS THE USER MODIFIES THE HTML
    const choices = [
      document.getElementById("choice1")! as HTMLInputElement,
      document.getElementById("choice2")! as HTMLInputElement,
      document.getElementById("choice3")! as HTMLInputElement,
      document.getElementById("choice4")! as HTMLInputElement,
      document.getElementById("choice5")! as HTMLInputElement,
    ];

    //SAME THING WITH CHOICES TEXT, GET THE CHOICE ELEMENT AT INDEX
    //THEN GET NEXT SIBLING (LABEL) AND GET THE TEXT CONTENT
    const choicesText = [
      choices[0].nextSibling!.textContent,
      choices[1].nextSibling!.textContent,
      choices[2].nextSibling!.textContent,
      choices[3].nextSibling!.textContent,
      choices[4].nextSibling!.textContent,
    ];
    //HERE WE CHECK IF ANSWERS ARE CORRECT OR INCORRECT
    //I'M SURE THERE IS A BETTER AND MUCH CLEANER WAY TO DO THIS,
    //I'M SORRY IN ADVANCE

    //SET THE CORRECT ANSWER ARRAY TO THE STATE VARIABLE CORRECT ANSWER
    //CORRECT ANSWER WAS SET WHEN THE QUESTION WAS LOADED FROM THE FILE
    // console.log(correctAnswer);
    const correctAnswerArray = correctAnswer! as string[];

    //CREATE ARRAY TO STORE CORRECT ANSWER IDS
    let correctAnswerId: number[] = [];

    //FIRST SET ALL IDS OF CORRECT ANSWERS
    //LOOP THROUGH ALL CHOICES
    for (let i = 0; i < choicesText.length; i++) {
      //FOR EACH CHOICE, LOOP THROUGH THE ANSWERS ARRAY
      for (let j = 0; j < correctAnswerArray.length; j++) {
        //IF THE CHOICE AND THE ANSWER ARE THE SAME, ADD CORRECT ANSWER
        //TO ID ARRAY
        if (choicesText[i] != null) {
          let comparisonString = String(choicesText[i]);

          comparisonString = comparisonString.replace(/</gm, "&lt;");
          comparisonString = comparisonString.replace(/>/gm, "&gt;");

          if (comparisonString == correctAnswerArray[j]) {
            correctAnswerId.push(i);
          }
        }
      }
    }

    //CREATE ARRAYS TO STORE THE CHOICES THE USER MADE
    //THAT ARE CORRECT AND INCORRECT
    let correctChoices = [];
    let incorrectChoices = [];

    //THIS IS THE REALLY MESSY AND CONVOLUTED PART
    //LOOP THROUGH ALL CHOICES
    for (let i = 0; i < choicesText.length; i++) {
      //IF CHOICE IS CHECKED
      if (choices[i].checked) {
        //SET FLAG TO DENOTE ANSWER IS CORRECT TO FALSE
        let flag = false;

        //LOOP THROUGH CORRECT ANSWERS ARRAY
        for (let j = 0; j < correctAnswerArray.length; j++) {
          //IF THE TEXT IS THE SAME, SET FLAG TO TRUE
          let comparisonString = String(choicesText[i]);

          comparisonString = comparisonString.replace(/</gm, "&lt;");
          comparisonString = comparisonString.replace(/>/gm, "&gt;");
          if (comparisonString == correctAnswerArray[j]) flag = true;
        }

        //IF FLAG TRUE PUSH TO CORRECT ANSWERS, IF NOT INCORRECT
        if (flag) {
          correctChoices.push({ id: i, text: choicesText[i] });
        } else {
          incorrectChoices.push({ id: i, text: choicesText[i] });
        }
      } else {
        //CHOICE IS NOT CHECKED

        //AGAIN CREATE FLAG, ONLY THIS TIME THIS FLAG IS
        //DENOTING THE ANSWER IS WRONG
        let flag = false;

        //SAME THING, LOOP THROUGH CORRECT ANSWERS ARRAY, IF FOUND =>
        //THIS ELEMENT IS NOT CHECKED BUT IS A CORRECT ANSWER
        for (let j = 0; j < correctAnswerArray.length; j++) {
          //SET FLAG TO DENOTE THAT ANSWER SHOULD BE CHECKED
          if (choicesText[i] == correctAnswerArray[j]) flag = true;
        }

        //I ACTUALLY DON'T UNDERSTAND WHY OR HOW THIS FINAL CHECK WORKS,
        //BUT IT DOES?
        if (flag) {
          //THESE choices[i].checked ARE NECESSARY FOR THIS SNIPPET TO WORK
          //OTHERWISE ALL THE CHOICES WILL BE PUSHED TO THE ARRAY WHETHER OR
          //NOT THEY'RE CHECKED, BUT FRANKLY I COULDN'T TELL YOU WHY
          if (choices[i].checked) {
            incorrectChoices.push({ id: i, text: choicesText[i] });
          }
        } else {
          if (choices[i].checked) {
            correctChoices.push({ id: i, text: choicesText[i] });
          }
        }
      }
    }

    //FINALLY, LOOP THROUGH CORRECT ANSWERS
    for (let i = 0; i < correctAnswerId.length; i++) {
      //GET ID OF THE CORRECT ANSWER
      const id = Number(correctAnswerId[i]);

      //CHECK IF THE CHOICE AT THAT ID IS CHECKED, IF NOT
      if (!choices[id].checked) {
        //PUSH CORRECT ANSWER TO INCORRECT ARRAY AS IT SHOULD BE CHECKED
        incorrectChoices.push({
          id: id,
          text: choicesText[id],
        });
      }
    }

    //UPDATE FORM ELEMENTS
    const explinationParent = document.getElementById(
      "questionExplinationWrapper"
    )!;

    const choiceWraps = [
      document.getElementById("choice1Wrap")! as HTMLInputElement,
      document.getElementById("choice2Wrap")! as HTMLInputElement,
      document.getElementById("choice3Wrap")! as HTMLInputElement,
      document.getElementById("choice4Wrap")! as HTMLInputElement,
      document.getElementById("choice5Wrap")! as HTMLInputElement,
    ];

    const correctChoicesArray = correctChoices;
    const incorrectChoicesArray = incorrectChoices;

    // console.log(correctChoicesArray, incorrectChoicesArray);

    for (let i = 0; i < correctChoicesArray.length; i++) {
      const currentCorrectAnswer = correctChoicesArray[i];
      choiceWraps[currentCorrectAnswer.id].setAttribute(
        "data-correct-highlight",
        "correct"
      );
    }

    let flag = false;
    for (let i = 0; i < incorrectChoices.length; i++) {
      const currentAnswer = incorrectChoices[i];
      for (let i = 0; i < correctAnswer!.length; i++) {
        if (!currentAnswer.text) return;
        if (
          currentAnswer.text.replace(/</gi, "&lt;").replace(/>/gi, "&gt;") ==
          correctAnswer![i]
        ) {
          choiceWraps[currentAnswer.id].setAttribute(
            "data-correct-highlight",
            "highlight"
          );
          flag = true;
          break;
        }
      }

      if (!flag) {
        choiceWraps[incorrectChoices[i].id].setAttribute(
          "data-correct-highlight",
          "incorrect"
        );
      }
    }

    //UNHIDE THE EXPLINATION BECAUSE THE QUESTION HAS BEEN SUBMITTED
    explinationParent.classList.remove("hidden");

    if (incorrectChoices.length == 0) {
      //IF NO INCORRECT ANSWERS
      //UPDATE THE EXPLINATION WRAPPER TO DISPLAY THE CHECK MARK AND CORRECT
      explinationParent.children[0].children[1].classList.remove("fa-x");
      explinationParent.children[0].children[1].classList.add("fa-check");
      explinationParent.children[0].children[0].innerHTML = "Correct";

      const explination = document.getElementById(
        "explination"
      )! as HTMLElement;
      const referencesWrap = document.getElementById(
        "references"
      )! as HTMLUListElement;
      const referencesHeader = document.getElementById(
        "referencesHeader"
      )! as HTMLElement;

      explination.innerHTML = "";
      referencesWrap.innerHTML = "";

      if (typeof questionObject.reference !== "string") {
        referencesHeader.innerHTML =
          "Still Confused About This Question? <br/>Check Out These References To Learn More";
        const questionArr = questionObject.reference;

        for (let i = 0; i < questionArr.length; i++) {
          const questionStringArray = String(questionArr[i]).split(": ");

          const reference = questionStringArray[0];
          const link = questionStringArray[1];

          const linkElement = `<a href="${link}" target="_blank">${reference}</a>`;

          const li = document.createElement("li");
          li.innerHTML = linkElement;
          li.className = "referenceListElement";

          referencesWrap.appendChild(li);
        }
      } else {
        referencesHeader.innerHTML =
          "Still Confused About This Question? <br/>Check Out This Reference To Learn More";
        const question = questionObject.reference;

        const questionStringArray = String(question).split(": ");

        const reference = questionStringArray[0];
        const link = questionStringArray[1];

        const linkElement = `<a href="${link}" target="_blank">${reference}</a>`;

        const li = document.createElement("li");
        li.innerHTML = linkElement;
        li.className = "referenceListElement";

        referencesWrap.appendChild(li);
      }

      //UPDATE THE CURRENT CORRECT STATE TO TRACK THE PLAYERS SCORE
      let current = currentCorrect;
      current++;
      setCurrentCorrect(current);

      //CHECK IF THE QUIZ SHOULD END
      if (currentIncorrect + current == quizLength) {
        //SET STATE THAT QUIZ ENDED, WILL UPDATE BUTTON TO CALL
        //SHOWFINISHINGSCREEN NEXT TIME CLICKED AND TEXT TO "SHOW RESULTS"
        setQuizEnded(true);
      }

      return;
    } else {
      //IF INCORRECT ANSWERS
      //UPDATE THE EXPLINATION WRAPPER TO DISPLAY THE X MARK AND INCORRECT
      explinationParent.children[0].children[1].classList.add("fa-x");
      explinationParent.children[0].children[1].classList.remove("fa-check");
      explinationParent.children[0].children[0].innerHTML = "Incorrect";

      //GET EXPLINATION WRAPPER AND REFERENCES LIST
      const explination = document.getElementById(
        "explination"
      )! as HTMLElement;
      const referencesHeader = document.getElementById(
        "referencesHeader"
      )! as HTMLElement;
      const referencesWrap = document.getElementById(
        "references"
      )! as HTMLUListElement;

      //CLEAR EXPLINATION AND REFERENCES CONTENTS
      explination.innerHTML = "";
      referencesHeader.innerHTML = "";
      referencesWrap.innerHTML = "";

      //UPDATE EXPLINATION DIV CONTENTS
      explination.innerHTML = questionObject.explination;

      //LOOP THROUGH QUESTION REFERENCES TO SEE IF THEY'RE MULTIPLE
      if (typeof questionObject.reference !== "string") {
        const questionArr = questionObject.reference;

        referencesHeader.innerHTML = "Check Out These References To Learn More";

        for (let i = 0; i < questionArr.length; i++) {
          const questionStringArray = String(questionArr[i]).split(": ");

          const reference = questionStringArray[0];
          const link = questionStringArray[1];

          const linkElement = `<a href="${link}" target="_blank">${reference}</a>`;

          const li = document.createElement("li");
          li.innerHTML = linkElement;
          li.className = "referenceListElement";

          referencesWrap.appendChild(li);
        }
      } else {
        const question = questionObject.reference;

        referencesHeader.innerHTML = "Check Out This Reference To Learn More";

        const questionStringArray = String(question).split(": ");

        const reference = questionStringArray[0];
        const link = questionStringArray[1];

        const linkElement = `<a href="${link}" target="_blank">${reference}</a>`;

        const li = document.createElement("li");
        li.innerHTML = linkElement;
        li.className = "referenceListElement";

        referencesWrap.appendChild(li);
      }

      //UPDATE THE CURRENT INCORRECT STATE TO TRACK THE PLAYERS SCORE
      let current = currentIncorrect;
      current++;
      setCurrentIncorrect(current);

      //CHECK IF THE QUIZ SHOULD END
      //console.log(current + currentCorrect);
      if (current + currentCorrect == quizLength) {
        //SET STATE THAT QUIZ ENDED, WILL UPDATE BUTTON TO CALL
        //SHOWFINISHINGSCREEN NEXT TIME CLICKED AND TEXT TO "SHOW RESULTS"
        setQuizEnded(true);
      }

      return;
    }
  };

  //ONCLICK FUNCTION FOR BUTTON TO START GAME, WILL RUN THROUGH PRETTY MUCH
  //ALL THE ABOVE CODE
  const nextQuestion = () => {
    startGame();
  };

  //ONCLICK FUNCTION TO DISPLAY ENDING SCREEN
  const showFinishingScreen = () => {
    // console.log(
    //   `quiz has ended! total score: ${currentCorrect} correct, ${currentIncorrect} incorrect`
    // );

    fetch("./results/", {
      method: "POST",
      //I KNOW THIS IS NOT SECURE WHATSOEVER, THE KEY IS QUITE LITERALLY
      //EXPOSED IN THE NETWORK REQUEST, THIS SHOULD BE CALLED THROUGH
      //MULTIPLE LAYERS OF OBFISCATION, BUT THIS IS NOT A PROJECT
      //I'M TOO WORRIED ABOUT SECURITY WITH
      headers: {
        writeKey: "Bearer " + process.env.NEXT_PUBLIC_POST_KEY,
      },
      body: JSON.stringify({
        correct: currentCorrect,
        incorrect: currentIncorrect,
        totalTime: totalTime,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
      });
  };

  //ADD EVENT LISTENERS TO ALL OF THE DIVS AND H3S TO CHECK THE RESPECTIVE
  //CHOICE ON THE FORM INPUT
  const addEventListenersForTextChoices = () => {
    // console.log("adding event listeners");
    if (!choicesHaveEventListeners) {
      //GET THE ELEMENTS WE ARE ADDING THE CLICK LISTENERS TO
      const choiceWraps: HTMLElement[] = [
        document.getElementById("choice1Wrap")!,
        document.getElementById("choice2Wrap")!,
        document.getElementById("choice3Wrap")!,
        document.getElementById("choice4Wrap")!,
        document.getElementById("choice5Wrap")!,
      ];

      const choiceText: HTMLElement[] = [
        document.getElementById("choice1Text")!,
        document.getElementById("choice2Text")!,
        document.getElementById("choice3Text")!,
        document.getElementById("choice4Text")!,
        document.getElementById("choice5Text")!,
      ];

      //NUMBER TO STORE THE CURRENT RADIO BUTTON ID THAT IS SELECTED
      let currentRadioSelection = -1;

      for (let i = 0; i < 5; i++) {
        //WE MUST GET THE CHOICES INSIDE THIS LOOP BECAUSE OTHERWISE
        //THE DISABLED PROPERTY DOESN'T GET UPDATED
        const choiceButtons: HTMLInputElement[] = [
          document.getElementById("choice1")! as HTMLInputElement,
          document.getElementById("choice2")! as HTMLInputElement,
          document.getElementById("choice3")! as HTMLInputElement,
          document.getElementById("choice4")! as HTMLInputElement,
          document.getElementById("choice5")! as HTMLInputElement,
        ];

        //THIS LIKELY IS NOT THE MOST EFFICIENT WAY TO DO THIS,
        //HOWEVER I NEED EACH OF THESE ELEMENTS TO LISTEN FOR A CLICK,
        //SO THIS LOOP OVER ALL ADD AN EVENT LISTENER TO EACH WORKS
        document.addEventListener("click", (e) => {
          // console.log(e.target);
          if (!choiceButtons[i].disabled) {
            if (e.target == choiceWraps[i] || e.target == choiceText[i]) {
              if (choiceButtons[i].checked) {
                choiceButtons[i].checked = false;
                currentRadioSelection = -1;
                return;
              } else {
                choiceButtons[i].checked = true;
                currentRadioSelection = i;
                return;
              }
            } else if (e.target == choiceButtons[i]) {
              if (currentRadioSelection == i) {
                choiceButtons[i].checked = !choiceButtons[i].checked;
                currentRadioSelection = -1;
                return;
              }
              for (let i = 0; i < choiceButtons.length; i++) {
                if (choiceButtons[i].checked) currentRadioSelection = i;
              }
            }
          }
        });
      }

      setChoicesHaveEventListeners(true);
    }
  };

  return (
    <div id="quizWrapper">
      {/* GET IF TIMER ENABLED, IF SO DISPLAY TIMER */}
      {props.timerEnabled && !submitted ? (
        <h1 id="gameTimer">
          {/* CURRENT TIME STATE AS TIME */}
          Time&nbsp;<span id="currentTime">- {currentTime}</span>
        </h1>
      ) : (
        ""
      )}

      <div id="quizGameWrapper" data-correct-highlight="">
        <h1 id="question"></h1>
        <div id="choice1Wrap">
          {/* IF THE CORRECT ANSWER NUM STATE IS LESS THAN OR EQUAL TO 1
          INPUT IS RADIO, ELSE CHECKBOX */}
          <input
            type={correctAnswerNum <= 1 ? "radio" : "checkbox"}
            name="quizSelect"
            id="choice1"
            className="quizSelect"
            disabled={submitted}
          />
          {/* AS WELL THIS INPUT DISABLES WHEN SUBMITTED STATE BECOMES TRUE */}
          <h3 id="choice1Text"></h3>
          {/* THIS LABEL IS UPDATED IN SETQUIZCONTENTS */}
        </div>
        <div id="choice2Wrap" data-correct-highlight="">
          {/* SEE CHOICE 1 WRAP */}
          <input
            type={correctAnswerNum <= 1 ? "radio" : "checkbox"}
            name="quizSelect"
            id="choice2"
            className="quizSelect"
            disabled={submitted}
          />
          <h3 id="choice2Text"></h3>
        </div>
        <div id="choice3Wrap" data-correct-highlight="">
          {/* SEE CHOICE 1 WRAP */}
          <input
            type={correctAnswerNum <= 1 ? "radio" : "checkbox"}
            name="quizSelect"
            id="choice3"
            className="quizSelect"
            disabled={submitted}
          />
          <h3 id="choice3Text"></h3>
        </div>
        <div id="choice4Wrap" data-correct-highlight="">
          {/* SEE CHOICE 1 WRAP */}
          <input
            type={correctAnswerNum <= 1 ? "radio" : "checkbox"}
            name="quizSelect"
            id="choice4"
            className="quizSelect"
            disabled={submitted}
          />
          <h3 id="choice4Text"></h3>
        </div>
        <div id="choice5Wrap" data-correct-highlight="">
          {/* SEE CHOICE 1 WRAP */}
          <input
            type={correctAnswerNum <= 1 ? "radio" : "checkbox"}
            name="quizSelect"
            id="choice5"
            className="quizSelect"
            disabled={submitted}
          />
          <h3 id="choice5Text"></h3>
        </div>
        {/* GETS TOGGLED TO SHOW WHETHER OR NOT THE ANSWER IS CORRECT + EXPLINATION */}
        <div id="questionExplinationWrapper">
          <h2>
            <span id="questionCorrectIncorrectText">&nbsp;Incorrect</span>
            <i
              id="questionCorrectIncorrectIcon"
              className="fa-solid fa-x"
              aria-hidden="true"
            ></i>
          </h2>

          <div id="explinationContentWrapper">
            <h3 id="explination"></h3>
            <h3 id="referencesHeader"></h3>
            <ul id="references"></ul>
          </div>
        </div>

        {/* BUTTON IS A LITTLE COMPLEX IN TERMS OF STATE, TO DETERMINE EVENT 
        HANDLER FIRST CHECKS IF NOT QUIZ  ENDED, IF TRUE AND NOT SUBMITTED 
        SUBMIT THE QUESTION, IF IT HAS BEEN SUBMITED CALL THE NEXT QUESTION
        FUNCTION, IF QUIZ HAS ENDED DISPLAY FINISHING SCREEN */}
        <button
          id="submitQuestion"
          onClick={
            !quizEnded
              ? !submitted
                ? submitQuestion
                : nextQuestion
              : showFinishingScreen
          }
        >
          {/* REALLY SIMULAR TO THE ABOVE CHECK EXCEPT JUST FOR TEXT, IF NOT 
          ENDED AND NOT SUBMITTED, TEXT = SUBMIT, IF SUBMITTED, TEXT = NEXT 
          QUESTION, IF ENDED, TEXT = SHOW RESULTS */}
          {!quizEnded
            ? !submitted
              ? "Submit"
              : "Next Question"
            : "Show Results"}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
