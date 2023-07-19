const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./scores.sqlite', (err) => {
    if (err) {
      console.log(err.message);
    }
    console.log('Connected to the scores database.');
  });


function saySomething()
{
    console.log("Building DB...");
    //db.all(`DROP TABLE score`);
    db.all(`CREATE TABLE score (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playerName INTEGER NOT NULL,
      created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      score INTEGER NOT NULL,
      level INTEGER NOT NULL
    )`);
}

//push our score to the database.
export default function handler(req, res)
{
  if (req.method === 'POST')
  {
  
    //saySomething();
    console.log(req.body);
    console.log(req.body.score);
    console.log(req.body.playerName);
    db.all(`INSERT INTO "score" (playerName, created, score, level)
          VALUES( \"`+ req.body.playerName +`\", datetime('now'), `+ req.body.score +`, `+ req.body.level +`)`);
    res.status(200).json({ msg : "The request is normal."})
  }
  else if (req.method === 'GET')
  {
    //A get request will be a client requesting the leaderboard.
    console.log('GET request recieved.');
    console.log(req.query);
    var tableWanted = req.query.level;
    db.all(`SELECT playerName, created, score FROM "score" WHERE level = `+ tableWanted +` ORDER BY score DESC `, [], (err, rows) => {
      //console.log(err);
      //output = {...rows};
      console.log("Inside is: " + rows);
      //output = {...rows};
      res.status(200).json({rows});
    } )
  }
}

const tempString = `GROUP BY level HAVING level = ORDER BY score DESC`;