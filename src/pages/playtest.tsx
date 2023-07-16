//import GameWindow from "../resources/GameWindow.mjs";
import {Game as GameType} from "phaser"
import React, { useState, useEffect } from "react"
import Huh from "../resources/scenes/TILE.png"
import UXHelper from "@/resources/UXHelper"

const xHelper = new UXHelper();
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
                    pixelArt: true
                }
            )

            setGame(GameWindow);
        }
        init();
    }, []);
    const [info, setInfo] = useState("None");
    function updateSide()
    {
        setInfo(xHelper.name);
    }

    return (
        <div>
            <div onClick={updateSide} id="gameSpot" key= "gameSpot" className="float-left pl-32 pt-24">
                {/* theoretically the game is here??? */}
            </div>
            <div className="mt-[2.5%] mb-[2.5%] mr-[2%] rounded-lg w-1/5 h-[89.5%] overflow-hidden bg-red-950 float-right">
            <SideBar info={info}/>
            </div>
        </div>
    )
}

var wordz = "a";
function SideBar(input)
{
    const [info, setInfo] = useState("None");
    const [word, useWord] = useState("a");

    useEffect(() => {
        setInfo(xHelper.name);
        console.log("Sidebar component has re-rendered.");
    }, [xHelper.name, wordz.length]);
    
    function Test()
    {
        console.log(wordz);
        console.log(wordz.length);
        setInfo(info + "a");
    }
    return(
        <div>
            <button onClick={Test}>Test</button>
            ----
            <div>{input.info} {wordz}</div>
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