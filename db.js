const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "node",
  port: "3306",
  waitForConnections: true,
});

if (pool) {
  console.log("banco conectado");
}

module.exports = pool;