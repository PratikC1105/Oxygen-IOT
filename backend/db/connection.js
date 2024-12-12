const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "54.251.105.92", // AWS database host
  user: "root", // Username for the database
  password: "", // No password required
  database: "oxygen", // Database name
  port: 3306, // Default MariaDB/MySQL port
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the AWS MariaDB database:", err);
    throw err;
  }

  console.log("Connected to the AWS MariaDB database...");
});

module.exports = db;
