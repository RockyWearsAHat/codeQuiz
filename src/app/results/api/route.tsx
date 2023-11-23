"use server";

import { promises as fs } from "fs";
import prisma from "./db";

export async function POST(req: Request) {
  const file = await fs.readFile("./src/app/results.json", "utf8");
  const fileContents = await JSON.parse(file);
  const name = await req.json();

  const savedScore = await prisma.score.create({
    data: { ...name, ...fileContents },
  });

  return new Response(JSON.stringify(savedScore.id));
}

export async function GET() {
  //GET ALL USERS IN THE DATABASE
  const allScores = await prisma.score.findMany();

  //BUBBLE SORT TO SORT ARRAY INTO BEST SCORE LOWEST TIME FIRST
  //KEEP TRACK OF THE JSON ELEMENT WE ARE REPLACING
  let temp;
  //BOOLEAN TO BREAK LOOP IF THERE WAS A SWAP TO RESTART AT NEXT ELEMENT
  let swapped = false;

  //LOOP THROUGH TO SECOND TO LAST ELEMENT
  for (let i = 0; i < allScores.length - 1; i++) {
    //RESET SWAPPED BOOLEAN
    swapped = false;

    //LOOP THROUGH ARRAY FROM 0 TO WHERE WE ARE (i) - 1 BECAUSE WE ADD 1
    for (let j = 0; j < allScores.length - i - 1; j++) {
      //CHECK IF ELEMENTS NEED TO SWAP
      if (
        //IF ELEMENT AT 0 IS LESS THAN ELEMENT 1 IN AMOUNT CORRECT
        allScores[j].correct < allScores[j + 1].correct ||
        //OR THE AMOUNT CORRECT IS THE SAME AND THE TOTAL TIME OF 0 IS MORE THAN 1
        (allScores[j].correct == allScores[j + 1].correct &&
          allScores[j].totalTime > allScores[j + 1].totalTime)
      ) {
        //ELEMENTS MUST SWAP
        //SET TEMP TO THE VALUE OF JSON AT 0 (j)
        temp = allScores[j];
        //JSON AT 0 (j) = NEXT JSON
        allScores[j] = allScores[j + 1];
        //NEXT JSON = LAST JSON SAVED IN TEMP => JSON 0
        allScores[j + 1] = temp;
        //SET SWAPPED BOOLEAN TO TRUE
        swapped = true;
      }
      //REPEAT THIS INNER FOR LOOP UNTIL SWAPPED IS FALSE OR MAX AMOUNT OF ITERATIONS
      //IF THERE IS NO SWAP DONE, MEANS ARRAY IS SORTED, AFTER THIS ITERATION THROUGH
      //THE ARRAY IS DONE WE CAN BREAK BECAUSE IT DOESN'T NEED ANY MORE SORTING
    }

    //IF THERE WAS NOT A SWAP IN THE INNER FOR LOOP, RETURN
    if (swapped == false) return new Response(JSON.stringify(allScores));
  }

  return new Response(JSON.stringify(allScores));
}
