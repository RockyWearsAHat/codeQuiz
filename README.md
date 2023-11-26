# This is a code quiz written by Alex

It includes a simple start menu with instructions and a highscores button, highscores are stored in a database so that any user who plays the quiz can see who uploaded their scores and how other people did.

Each question is declared inside of questions.json, and there are some options for writing questions, each question should have 5 choices to it, the correctAnswer value can either be an array or a single string to determine whether there should be multiple answers or not. Multiple references can be declared as well for each question using an array. References are parsed by DISPLAYNAME: https://linktothesite.com/ where a list element like <a href="https://linktothesite.com/">DISPLAYNAME</a> will be created. Individual times can also be declared for questions with the "time" attribute, however the quiz will default to 30 seconds per question if no time attribute is specified. Codeblocks can also be written into questions using ``` to wrap the block. Simple parsing also allows for newline and tab to be used in the question using \t and \n, unfortunatley to get &lt;h1&gt; in questions you do have to wrap them in escape characters otherwise the parser will treat them like elements, however this does also mean the questions can be inline styled.

There are also some simple options for taking the quiz, the leaderboards are arranged by correct scores and also by the lowest time, there is an option to turn the timer off, but the prompt to upload to the database will not display if you decide to play without the timer.

Questions are drawn randomly from the questions.json file and will not repeat until the length of the file is hit.

Scores are stored on a PlanetScale DB and this site is built with NextJS, so unfortunatley this site isn't particularly functional on github pages. The weather API will be built in pure JS though so it will be. I'm sorry for publishing this on Vercel yet again, I will not be doing so in the future.
