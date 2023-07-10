//import GameWindow from "../resources/GameWindow.mjs";
import {Game as GameType} from "phaser"
import { useState, useEffect } from "react"
import Huh from "../resources/scenes/TILE.png"


function GameThing()
{
    const [game, setGame] = useState<GameType>();

    useEffect( () => {
        async function init()
        {
            const Phaser = await import('phaser');
            const { default: Preloader } = await import('../resources/scenes/preloader.js');
            const { default: Arenamap } = await import('../resources/scenes/arenamap.js');

            const GameWindow = new Phaser.Game(
                {
                    type: Phaser.AUTO,
                    parent: "gameSpot",
                    scene:
                    [
                        Preloader,
                        Arenamap
                    ],
                    pixelArt: true
                }
            )

            setGame(GameWindow);
        }
        init();
    }, []);

    return (
        <div id="gameSpot" key= "gameSpot" className="pl-8">
            {/* theoretically the game is here??? */}
        </div>
    )
}

export default function test()
{
    return(
        <main style={{backgroundColor: "blue"}}>
            above
            <GameThing/>
            and below {Huh.src}


        </main>
    )
}