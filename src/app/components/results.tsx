import React, { useState } from "react";
import { highscoresProps } from "./highscoresList";

export type ResultsPageProps = {
  id: string;
  "data-enabled": boolean;
  correct?: number;
  incorrect?: number;
  totalTime?: number;
};

let scoreSubmitted = false;

async function saveScore(e: React.FormEvent<HTMLFormElement>) {
  const scoreStatusText = document.getElementById("scoreStatus")!;
  e.preventDefault();
  if (scoreSubmitted) {
    location.reload();
    return false;
  }
  const nameInput = document.getElementById("name") as HTMLInputElement;
  if (!nameInput.value) {
    scoreStatusText.innerHTML = "Issue Uploading Score, Name Cannot Be Blank!";
    scoreStatusText.style.color = "red";
    return;
  }
  const results: { correct: number; incorrect: number; totalTime: number } =
    JSON.parse(document.cookie);
  console.log(results);
  const postBody = {
    name: nameInput.value,
    correct: results.correct,
    incorrect: results.incorrect,
    time: results.totalTime,
  };
  console.log(postBody);

  const res = await fetch("./results/api/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postBody),
  });

  if (!res.ok) {
    scoreStatusText.innerHTML = "Issue Uploading Score, Please Try Again!";
    scoreStatusText.style.color = "red";
    return false;
  }

  const newScoreId = await res.json();
  const pageInput = document.getElementById(
    "highscoreHighlightId"
  ) as HTMLInputElement;
  pageInput.value = newScoreId;
  scoreStatusText.innerHTML = "Score Uploaded Successfully!";
  scoreStatusText.style.color = "lime";
  scoreSubmitted = true;
  const submitBtn = document.getElementById("submitScoreButton")!;
  submitBtn.innerHTML = "Retake Quiz";
  return false;
}

const ResultsPage = (props: ResultsPageProps) => {
  return (
    <div id="resultsPage">
      <div id="resultsWrapper">
        <h1>Results</h1>
        <h2>
          Correct - {props.correct}
          <span className="correct">
            <i className="fa-solid fa-check"></i>
          </span>
        </h2>
        <h2>
          Incorrect - {props.incorrect}
          <span className="incorrect">
            <i className="fa-solid fa-x"></i>
          </span>
        </h2>
        {props.totalTime ? (
          <>
            <h2>Total Time - {props.totalTime} seconds</h2>
            <form onSubmit={saveScore} id="uploadToDBForm">
              <h1>Upload Score To Database</h1>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Name / Initials"
              />
              <button type="submit" id="submitScoreButton">
                Save
              </button>
            </form>
          </>
        ) : (
          <></>
        )}

        <h3 id="scoreStatus"></h3>

        <button id="resultsPageHighscoresBtn">Highscores</button>
      </div>
      <input type="text" name="val" id="highscoreHighlightId" hidden />
    </div>
  );
};

export default ResultsPage;
