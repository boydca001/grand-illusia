import Phaser, {Game as GameType} from "phaser"
import Preloader from "./scenes/preloader1.js/index.js"
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