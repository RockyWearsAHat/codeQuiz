-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "correct" INTEGER NOT NULL,
    "incorrect" INTEGER NOT NULL,
    "totalTime" INTEGER NOT NULL
);
