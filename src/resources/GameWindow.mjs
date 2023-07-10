import Phaser, {Game as GameType} from "phaser"
import Preloader from "./scenes/preloader.js/index.js"
import Arenamap from "./scenes/arenamap"
import { useState } from 'react'

const GameWindow = Phaser.Game(
    {
        type: Phaser.AUTO,
        parent: "gameSpot",
        scene:
        [
            Preloader,
            Arenamap
        ]
    }
)

export default GameWindow;