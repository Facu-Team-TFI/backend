import { Sequelize } from "sequelize";

const sequelize = new Sequelize("CarpinChords", "root", "42703821", {
  host: "localhost",
  dialect: "mysql",
});

export default sequelize;
