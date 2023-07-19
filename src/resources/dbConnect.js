const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('../../db/scores.sqlite', (err) => {
    if (err) {
      console.log(err.message);
    }
    console.log('Connected to the scores database.');
  });

function saySomething()
{
    db.all(`INSERT INTO score (playerName, created, score)
        VALUES("Cori", datetime('now'), 100)
    `);
}
saySomething();