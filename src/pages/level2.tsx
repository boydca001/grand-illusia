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
            const { default: Preloader2 } = await import('../resources/scenes/preloader2.js');
            const { default: Arenamap } = await import('../resources/scenes/arenamap.js');
            const { default: UIScene } = await import('../resources/scenes/UIScene.js')

            const GameWindow = new Phaser.Game(
                {
                    type: Phaser.AUTO,
                    parent: "gameSpot",
                    scene:
                    [
                        Preloader2,
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
        const res = await fetch('api/scoreSave?level=2')
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
                Welcome to Level 2

                <li>You may have noticed that whenever a character passes their turn, half of an action point is restored.</li>

                <li>A character who Passed their turn cannot act again untiul the next round, but they can provide inspiration to their more active allies to act again!</li>

                If you had three allies, you could allow a unit to act twice. These slimes will use that tactic if only one of them reaches you.
                Defeat them all before you are overwhelmed!
                <hr/>
                <li className="text-base">Ivene has joined your side. He knows a powerful magical Skill that can be used from four tiles away. Use it to your advantage!</li>
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