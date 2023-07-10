var mysql = require('mysql2');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kosomen2",
  database: "illusiadb"
});

/*con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE IF NOT EXISTS illusiadb", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});*/


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query(
    "CREATE TABLE accounts ("
    + "id INT AUTO_INCREMENT PRIMARY KEY, "
    + "name VARCHAR(24), "
    + "password VARCHAR(30), "
    + "email VARCHAR(255))", 
    function (err, result) {
    if (err) throw err;
    console.log("account table created");
  });
});


/*con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("DROP DATABASE illusiadb", function (err, result) {
    if (err) throw err;
    console.log("Database deleted!");
  });
});*/