"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Quiz from "./components/quiz";
import ResultsPage, { ResultsPageProps } from "./components/results";
import HighscoresList, { highscoresProps } from "./components/highscoresList";
import type { Score } from "@prisma/client";

let instructionsState = false;
let highscoresState = false;
let highscoresLoading = false;
let currentHighscores: Score[] = [];

export default function Home() {
  const [timerEnabled, setTimerEnabled] = useState(false);

  const [quizDone, setQuizDone] = useState(false);

  const startGame = () => {
    const startMenu = document.querySelector("#startMenuWrap")!;

    startMenu.classList.add("gameStarted");
    const timerOnBtn = document.querySelector("#timerOn") as HTMLInputElement;
    if (timerOnBtn.checked) {
      setTimerEnabled(true);
    } else {
      setTimerEnabled(false);
    }
  };

  const closeInstructionsMenu = () => {
    const instructions = document.querySelector("#instructionsWrapper");

    instructions?.classList.remove("showInstructions");
    instructionsState = false;
  };

  const openInstructionsMenu = () => {
    const instructions = document.querySelector("#instructionsWrapper");

    instructions?.classList.add("showInstructions");
    instructionsState = true;
  };

  const toggleInstructionsMenu = () => {
    switch (instructionsState) {
      case false:
        openInstructionsMenu();
        break;
      case true:
        closeInstructionsMenu();
        break;
    }
  };

  const closeHighscoresMenu = () => {
    const highscores = document.querySelector("#highscoresWrapper");

    highscores?.classList.remove("highscoresOpen");
    highscoresState = false;
  };

  const openHighscoresMenu = () => {
    const highscores = document.querySelector("#highscoresWrapper");

    highscores?.classList.add("highscoresOpen");
    highscoresState = true;

    getScores();
  };

  const toggleHighscoresMenu = () => {
    switch (highscoresState) {
      case false:
        openHighscoresMenu();
        break;
      case true:
        closeHighscoresMenu();
        break;
    }
  };

  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [currentHighscores, setCurrentHighscores] = useState<Array<Score>>([]);

  const showResults = () => {
    setQuizDone(true);

    fetch("/results/", {
      method: "GET",
    })
      .then((res) => {
        const json = res.json();
        return json;
      })
      .then((json) => {
        try {
          setCorrectCount(json.correct);
          setIncorrectCount(json.incorrect);
          setTotalTime(json.totalTime);
        } catch (err) {
          console.log(err);
        }
      });
  };

  useEffect(() => {
    const resultsElementProps = document.getElementById("resultsPage");
    resultsElementProps?.setAttribute("data-enabled", String(quizDone));
  }, [quizDone]);

  useEffect(() => {
    let showResultsFlag = false;
    document.addEventListener("click", (e: Event) => {
      let instructions = document.querySelector("#instructionsWrapper");
      let openInstructions = document.querySelector("#openInstructions");
      let target = e.target as HTMLElement;
      if (
        target.id != instructions?.id &&
        !instructions?.contains(target) &&
        target.id != openInstructions?.id
      ) {
        closeInstructionsMenu();
      }

      const highscoresWrapper = document.getElementById("highscoresWrapper")!;
      const highscoresBtn = document.getElementById("navBar")!.children[1];
      let resultsPageHighscoreBtn = document.getElementById(
        "resultsPageHighscoresBtn"
      );

      let savingScoreToDBBtn = document.getElementById("submitScoreButton");

      if (
        target.id != highscoresWrapper?.id &&
        !highscoresWrapper?.contains(target) &&
        target.id != highscoresBtn?.id &&
        target.id != resultsPageHighscoreBtn?.id &&
        target.id != savingScoreToDBBtn?.id
      ) {
        closeHighscoresMenu();
      }

      if (
        target.id == document.getElementById("submitQuestion")?.id &&
        document.getElementById("submitQuestion")?.textContent ===
          "Show Results"
      ) {
        if (showResultsFlag) {
          showResults();
          showResultsFlag = false;
        } else {
          showResultsFlag = true;
        }
      }
    });

    if (!sessionStorage.getItem("timer")) {
      sessionStorage.setItem("timer", "false");
    }

    const timer = sessionStorage.getItem("timer");
    if (timer === "true") {
      const onBtn = document.querySelector("#timerOn") as HTMLInputElement;
      onBtn.checked = true;
    } else {
      const offBtn = document.querySelector("#timerOff") as HTMLInputElement;
      offBtn.checked = true;
    }
  }, []);

  useEffect(() => {
    const resultsPageHighscoreBtn = document.getElementById(
      "resultsPageHighscoresBtn"
    )!;

    resultsPageHighscoreBtn.onclick = () => {
      toggleHighscoresMenu();
    };
  }, [highscoresState]);

  useEffect(() => {
    let savingScoreToDBBtn = document.getElementById("submitScoreButton");
    if (!savingScoreToDBBtn) return;

    savingScoreToDBBtn!.addEventListener("click", async () => {
      if (savingScoreToDBBtn?.innerHTML == "Save") {
        await new Promise((res) => setTimeout(res, 500));
        openHighscoresMenu();
      }
    });
  }, [correctCount, incorrectCount]);

  const getScores = () => {
    highscoresLoading = true;
    const res = fetch("./results/api")
      .then((data) => data.json())
      .then((json) => {
        const arr = Array.from<Score>(json);
        setCurrentHighscores(arr);
        highscoresLoading = false;
      });
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
        integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <div id="mainWrapper">
        <div id="startMenuWrap">
          <nav id="navBar">
            <button onClick={toggleInstructionsMenu}>
              <i
                id="openInstructions"
                className="fa-regular fa-circle-question"
              ></i>
            </button>
            <button onClick={toggleHighscoresMenu}>Highscores</button>
          </nav>
          <h1>Code Quiz</h1>
          <button id="startBtn" onClick={startGame}>
            Start
          </button>

          <div id="timer">
            <h1>Timer</h1>
            <div id="timerOnWrap">
              <input
                type="radio"
                id="timerOn"
                name="enableTimer"
                value="ON"
                onClick={() => {
                  sessionStorage.setItem("timer", "true");
                }}
              />
              <label htmlFor="timerOn">ON</label>
            </div>
            <div id="timerOffWrap">
              <input
                type="radio"
                id="timerOff"
                name="enableTimer"
                value="OFF"
                onClick={() => {
                  sessionStorage.setItem("timer", "false");
                }}
              />
              <label htmlFor="timerOff">OFF</label>
            </div>
          </div>
          <div id="instructionsWrapper" className="">
            <button id="closeInstructionsMenu" onClick={closeInstructionsMenu}>
              <i className="fa-regular fa-circle-xmark"></i>
            </button>
            <h1>Hello!</h1>
            <p>
              This is a simple code quiz by Alex, to start, just select whether
              or not you want the timer on, and click start, to see the
              highscores of other players just click on the highscores button.
              <br />
              <br />
              Each question is randomly drawn from a bank and will have five
              choices. One or multiple can be correct (indicated with circular
              or square checkboxes inside the quiz). Take your best guess and at
              the end you&apos;ll recieve a tally, + if the timer is on, you
              will additionally recieve your total time and the option to upload
              your score to the database for other players to see. I hope this
              is useful and someone learns an interesting tidbit along the way.
              <br />
              <br />
              Note - The upload score button will only show up IF THE TIMER IS
              ON
            </p>
          </div>
        </div>
        <Quiz timerEnabled={timerEnabled} numberOfQuestions={5} />
        <ResultsPage
          id="resultsPage"
          data-enabled={quizDone}
          correct={correctCount}
          incorrect={incorrectCount}
          totalTime={totalTime}
        />

        <div id="highscoresWrapper">
          <button id="closeHighscoresMenu" onClick={closeHighscoresMenu}>
            <i className="fa-regular fa-circle-xmark"></i>
          </button>
          <h1>Leaderboard</h1>
          <HighscoresList
            isLoading={highscoresLoading}
            content={currentHighscores}
          />
        </div>
      </div>
    </>
  );
}
