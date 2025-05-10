import { Sequelize } from "sequelize"

const sequelize = new Sequelize('postgres://buddha:buddha@localhost:5999/mydb')

export default sequelize