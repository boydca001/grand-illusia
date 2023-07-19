//import GameWindow from "../resources/GameWindow.mjs";
import {Game as GameType} from "phaser"
import React, { useState, useEffect } from "react"





function GameThing()
{
    const [game, setGame] = useState<GameType>();

    useEffect( () => {
        async function init()
        {
            const Phaser = await import('phaser');
            const { default: Preloader3 } = await import('../resources/scenes/preloader3.js');
            const { default: Arenamap } = await import('../resources/scenes/arenamap.js');
            const { default: UIScene } = await import('../resources/scenes/UIScene.js')

            const GameWindow = new Phaser.Game(
                {
                    type: Phaser.AUTO,
                    parent: "gameSpot",
                    scene:
                    [
                        Preloader3,
                        Arenamap,
                        UIScene
                    ],
                    dom: {
                        createContainer: true
                    },
                    pixelArt: true
                }
            )

            setGame(GameWindow);
        }
        init();
    }, []);
    const [info, setInfo] = useState("None");

    return (
        <div>
            <div id="gameSpot" key= "gameSpot" className="float-left pl-32 pt-24">
                {/* theoretically the game is here??? */}
            </div>
            <div className="mt-[2.5%] mb-[2.5%] mr-[2%] rounded-lg w-1/5 h-[90vh] overflow-hidden bg-red-950 float-right">
            <SideBar />
            </div>
        </div>
    )
}


function SideBar()
{
    const [showState, setShowState] = useState(false);

    const [scoreData, setScoreData] = useState([]);
    
    async function getScores()
    {
        const res = await fetch('api/scoreSave?level=3')
        .then((response) => response.json())
        .then((scores) => {
            //console.log(scores.rows);
            setScoreData(scores.rows);
        });
    }

    function toggleMenu()
    {
        if (showState)
        {
            setShowState(false);
        }
        else
        {
            getScores();
            setShowState(true);
        }
    }

    if(!showState)
    {
        //show the regular info.
        return(
            <div className="font-sans text-lg">
                <button onClick={toggleMenu} className="rounded-t-lg bg-pink-800 w-full">
                    Toggle Info/Scores
                </button>
                <div className="pl-2">
                Welcome to the final stage!

                <li>Don't forget to check the various characters and enemies' stats!</li>

                <li>Physical attacks are reduced by Defense, and Magical attacks are reduced by Spirit.</li>
                Likewise, Physical attacks are powered by Atttack and Magical attacks are powered by Force.

                Use what you've learned in the previous to decide the correct approach on defeating these two powerful enemies!
                <hr/>
                <li className="text-base">Stollen, a friendly green slime, has joined your side. Although he cannot attack very well, he is incredibly resilient! Use this to your advantage.</li>
                </div>
            </div>
        )
    }

    return(
        <div>
        <button onClick={toggleMenu} className="rounded-t-lg bg-pink-800 w-full">
            Toggle Info/Scores
        </button>
        <hr></hr>
        {
        scoreData.map((score, index) => {
            return <div><li key={index}>#{index + 1}. {score.playerName} - {score.score} points</li><br></br><hr className="bg-pink-900"></hr></div>
        })
        }
        </div>
    )
}

/*
function Time()
{
    setInterval(updateTime, 1000);
    const now = new Date().toLocaleTimeString();
    const [time,setTime] = useState(now);

    function updateTime()
    {
        const newtime = new Date().toLocaleTimeString();
        setTime(newtime);
    }
    return(
        <h2>{time}</h2>
    )
}
*/


export default function test()
{
    return(
        <main style={{backgroundColor: "blue"}}>
            <div className="bg-blue-950 h-screen">
                <div>
                    <GameThing/>
                </div>
                
            </div>


        </main>
    )
}