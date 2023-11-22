import type { Score } from "@prisma/client";
import React, { useEffect, useState } from "react";

export type highscoresProps = {
  isLoading: boolean;
  content?: Score[];
};

const addNumbersToHighscores = () => {
  const wrapper = document.getElementById("highscoresList");
  if (!wrapper) return;

  // console.log(wrapper);
  const listElements = wrapper.children;

  for (let i = 0; i < listElements.length; i++) {
    listElements[i].setAttribute("placement", String(i + 1));
  }
};

function HighscoresList({ ...props }: highscoresProps) {
  const [highlighted, setHighlighted] = useState("");
  useEffect(() => {
    addNumbersToHighscores();

    const highscoresList = document.getElementById(
      "highscoreHighlightId"
    ) as HTMLInputElement;
    if (!highscoresList) return;
    if (!highscoresList.value) return;
    setHighlighted(highscoresList.value);

    setTimeout(() => {
      const highlightedItem = document.querySelector(
        "#highscoresList > li[data-highlight='true']"
      ) as HTMLElement;
      if (!highlightedItem) return;

      highlightedItem.scrollIntoView({ behavior: "smooth", inline: "nearest" });
    }, 100);
  }, [props.content]);

  return props.isLoading ? (
    <h1>Loading...</h1>
  ) : (
    <ul id="highscoresList">
      {props.content?.map((item) => {
        return (
          <li
            key={item.id}
            data-highlight={item.id == highlighted ? true : false}
          >
            <h3 id="name">{item.name}</h3>
            <h3 id="correct">
              {item.correct}
              <i className="fa-solid fa-check" aria-hidden></i>
            </h3>
            <h3 id="incorrect">
              {item.incorrect}
              <i className="fa-solid fa-x" aria-hidden></i>
            </h3>
            <h3 id="time">{item.totalTime} seconds</h3>
          </li>
        );
      })}
    </ul>
  );
}

export default HighscoresList;
