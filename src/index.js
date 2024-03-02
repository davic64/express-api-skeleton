#!/usr/bin/env nodeZ
import inquirer from "inquirer";
import chalk from "chalk";
import createApi from "./framework.js";

async function generateApiSkeleton() {
  const questions = [
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
    },
    {
      type: "list",
      name: "database",
      message: "Database:",
      choices: ["MongoDB", "PostgreSQL"],
    },
  ];

  const answers = await inquirer.prompt(questions);

  if (answers.database === "PostgreSQL") {
    answers.orm = await inquirer.prompt({
      type: "list",
      name: "orm",
      message: "ORM:",
      choices: ["Sequelize", "Prisma", "TypeORM"],
    });
  } else if (answers.database === "MongoDB") {
    answers.orm = await inquirer.prompt({
      type: "list",
      name: "orm",
      message: "ORM:",
      choices: ["Mongoose", "Prisma"],
    });
  }

  const { projectName, database, orm } = answers;

  const projectPath = `./${projectName}`;

  createApi(projectName, projectPath, database, orm.orm);

  console.log(
    `\n${chalk.yellow(
      `Project ${projectName} successfully created!`
    )}\n\n${chalk.green.bold(`cd ${projectName}`)}\n${chalk.green.bold(
      "npm i"
    )}\n${chalk.blue.bold("npm run dev")}`
  );
}

generateApiSkeleton();
