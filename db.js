const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',          // your MySQL root password
  database: 'notes_sharing'     // make sure this database exists
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL DB!');
});

module.exports = db;
