import { writeFileSync, mkdirSync, readFileSync } from "fs";
import slugFormat from "./utils/slugFormat.js";
import { exec } from "child_process";
import { promisify } from "util";
import setFiles from "./files.js";
const execAsync = promisify(exec);

async function rootDirectories(projectName) {
  try {
    const directories = [
      "controllers",
      "models",
      "services",
      "routes",
      "middlewares",
      "utils",
    ];

    await Promise.all(
      directories.map((dir) => mkdirSync(`${projectName}/src/${dir}`))
    );
  } catch (error) {
    console.log(error);
  }
}

async function rootFiles(projectName, projectPath, orm) {
  const files = setFiles(orm);
  try {
    const readmeContent = `# ${projectName}\n\nThis is a project generated with the API skeleton generator with Express.\n\nCustomize this file according to your needs!`;
    writeFileSync(`${projectPath}/README.md`, readmeContent);

    const gitignoreContent = `node_modules\n.env`;
    writeFileSync(`${projectPath}/.gitignore`, gitignoreContent);

    const envContent = `#API\nAPI_PORT=\n\n# Database\n${
      orm === "Sequelize"
        ? "DB_DIALECT=\nDB_HOST=\nDB_NAME=\nDB_USERNAME=\nDB_PASSWORD=\nDB_PORT="
        : "DB_URI="
    }`;
    writeFileSync(`${projectPath}/.env.example`, envContent);

    await Promise.all(
      Object.entries(files).map(([file, data]) =>
        writeFileSync(`${projectPath}/${file}`, data, { flag: "wx" })
      )
    );
  } catch (error) {
    console.log(error);
  }
}

function packageJsonFile(projectName, projectPath) {
  const packageJsonPath = `${projectPath}/package.json`;
  const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonContent);
  packageJson.name = slugFormat(projectName);

  packageJson.scripts = {
    start: "node src/index.js",
    dev: "nodemon src/index.js",
  };

  writeFileSync(
    `${projectPath}/package.json`,
    JSON.stringify(packageJson, null, 2)
  );
}

async function createApi(projectName, projectPath, database, orm) {
  mkdirSync(`${projectName}/src`, { recursive: true });
  await execAsync(`cd ${projectName} && npm init -y`);
  packageJsonFile(projectName, projectPath);

  const packages = ["express", "dotenv", "cors"];
  const devDependencies = ["nodemon"];

  if (database === "PostgreSQL") {
    packages.push("pg");
    if (orm === "Sequelize") {
      mkdirSync(`${projectName}/src/store`);
      packages.push("sequelize");
      devDependencies.push("sequelize-cli");
    }
    if (orm === "TypeORM") {
      packages.push("typeorm", "reflect-metadata");
    }
  }

  if (database === "MongoDB") {
    if (orm === "Mongoose") {
      packages.push("mongoose");
    }
  }

  if (orm === "Prisma") {
    packages.push("prisma", "@prisma/client");
  }

  await Promise.all([
    execAsync(
      `cd ${projectName} && npm install ${packages.join(
        " "
      )} && npm install -D ${devDependencies.join(" ")}`
    ),

    rootDirectories(projectName).then(
      async () => await rootFiles(projectName, projectPath, orm)
    ),
  ]);

  if (orm === "Prisma") {
    execAsync(`cd ${projectName} && npx prisma && npx prisma init`);
  }
}

export default createApi;
