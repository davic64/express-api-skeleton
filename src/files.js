const filesContent = {};

filesContent["src/index.js"] = `import express from "express";
import "dotenv/config";
import cors from "cors";
import config from "./config";

const app = express();
app.use(express.json());
app.use(cors());
const port = config.api.port;

app.get("/", (_, res) => {
  res.send("API");
});

app.listen(port, () => {
    console.log(\`[server]: Server is running at http://localhost:\${port}\`);
});
`;

const sequelizeConfig = `import Sequelize from "sequelize";
import config from "../config";

const sequelize = new Sequelize(
  config.db.name,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: false,
  }
);

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("[server]: DB connected");
    // await sequelize.sync({ force: true });
  } catch (error) {
    console.log("[server]: DB connection error: ", error);
    setTimeout(connection, 2000);
  }
};

connection();

setupModels(sequelize);

// Services
const create = async (data) => {
  try {
    return await data.save();
  } catch (error) {
    return error;
  }
};

const list = async (Model, filters = {}, include = []) => {
  try {
    const dataList = await Model.findAll({
      where: filters,
      include: [...include],
    });
    return dataList;
  } catch (error) {
    return error;
  }
};

const get = async (Model, item, include = []) => {
  try {
    const uniqueData = await Model.findOne({ where: item, include });
    return uniqueData;
  } catch (error) {
    return error;
  }
};

const update = async (Model, id, data) => {
  try {
    const dataUpdate = await Model.update(data, {
      where: {
        id,
      },
      returning: true,
    });
    return dataUpdate[1][0];
  } catch (error) {
    return error;
  }
};

const destroy = async (Model, id) => {
  try {
    await Model.destroy({
      where: {
        id,
      },
    });
  } catch (error) {
    return error;
  }
};

module.exports = {
  create,
  list,
  get,
  update,
  destroy,
};
`;

const dbConfig = {
  dialect: process.env.DB_DIALECT || "postgres",
  host: process.env.DB_HOST || "localhost",
  name: process.env.DB_NAME || "postgres",
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT || 5432,
};

export const setFiles = (orm) => {
  const configFileContent = `
      export default {
        api: {
            port: process.env.API_PORT || 8080,
        },
        db: ${
          orm === "Sequelize"
            ? JSON.stringify(dbConfig, null, 2)
            : 'process.env.DB_URI || ""'
        },
      };
    `;

  filesContent["src/config.js"] = configFileContent;
  if (orm === "Sequelize")
    filesContent["src/store/postgres.js"] = sequelizeConfig;

  return filesContent;
};

export default setFiles;
