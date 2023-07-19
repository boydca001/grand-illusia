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
            const { default: Preloader } = await import('../resources/scenes/preloader.js');
            const { default: Arenamap } = await import('../resources/scenes/arenamap.js');
            const { default: UIScene } = await import('../resources/scenes/UIScene.js')

            const GameWindow = new Phaser.Game(
                {
                    type: Phaser.AUTO,
                    parent: "gameSpot",
                    scene:
                    [
                        Preloader,
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
        const res = await fetch('api/scoreSave?level=1')
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
                This is the tutorial level for Grand Illusia!

                <li>You control the girl in the green dress, Maya. The objective is to defeat the blue slime on the other side of the map!</li>

                <li>You can tell if a character is on your side by selecting them. A character you control has multiple options, while only an enemy's stats are visible.</li>

                From top to bottom on the selection menu:
                <hr/>
                <li className="text-base">Action: Use a skill that the character knows. Maya can perform the basic Strike skill. A character can normally do only one action.</li>
                <hr/>
                <li className="text-base">Move: Move a character up to 4 tiles away. This doesn't cost an action, but must be done before you choose an action.</li>
                <hr/>
                <li className="text-base">Status: Check a character's status. Helpful for finding out what a character's talents are.</li>
                <hr/>
                <li className="text-base">Pass: Expend an action without doing anything. This character cannot act until the next turn.</li>
                <hr/>
                Your score is based on how you performed in combat. Try to defeat enemies quickly, and deal as much damage as you can!
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