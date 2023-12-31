"use server";

import { promises as fs } from "fs";

export async function POST(req: Request) {
  const body = await req.text();
  let arr = JSON.parse(body);

  const file = await fetch(
    `https://raw.githubusercontent.com/RockyWearsAHat/codeQuiz/main/src/app/questions.json`,
    { method: "GET" }
  );

  const data = await file.json();
  const dataArr = Array<any>();
  const questionsLength = Object.keys(data).length;

  for (var i in data) dataArr.push([i, data[i]]);

  //if (arr.length >= questionsLength) arr = [];
  const generateRandomIdNotBeenSelectedYet = async () => {
    let rand = Math.floor(Math.random() * questionsLength);

    if (arr.length < questionsLength) {
      if (arr.length == 0) {
        return new Response(JSON.stringify(rand));
      }

      if (arr.includes(rand)) {
        while (arr.includes(rand)) {
          rand = Math.floor(Math.random() * questionsLength);
        }
        return new Response(JSON.stringify(rand));
      }
    }
    return new Response(JSON.stringify(rand));
  };

  let rand = await generateRandomIdNotBeenSelectedYet();

  const randVal: number = await JSON.parse(await rand.json());
  const questionObj = dataArr[randVal][1];

  return new Response(JSON.stringify({ id: randVal, question: questionObj }));
}
