import { Scene } from "phaser"
//import Tile from './TILE.png'
//import MapStuff from './basicMap.json'
//import Map2 from './basicMap.csv'

export default class Preloader extends Scene
{
    constructor()
    {
        super('preloader')
    }
    preload()
    {
        //BASE GAME ASSETS START ---
        this.load.image('grasstile', 'assets/TILE.png');
        this.load.image('pointer', 'assets/indicator.png');
        this.load.image('target', 'assets/target.png');
        //load currently extant unit sprites:
        this.load.image('Maya', 'assets/Maya.png');
        this.load.image('Ivene', 'assets/Ivene.png');
        this.load.image('Slime', 'assets/Slime.png');

        //load anything related to animations.
        this.load.spritesheet('sk_strike', 'assets/sk_strike.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('sk_bounce', 'assets/sk_bounce.png', {frameWidth: 64, frameHeight: 64});
        this.load.image('watersphere', 'assets/watersphere.png');

        //load ui elements
        this.load.image('ui_prompt', 'assets/ui_prompt.png');
        this.load.image('ui_action', 'assets/ui_action.png');
        this.load.image('ui_move', 'assets/ui_move.png');
        this.load.image('ui_status', 'assets/ui_status.png');
        this.load.image('ui_cancel', 'assets/ui_cancel.png');
        this.load.image('ui_info', 'assets/ui_info.png');
        this.load.image('ui_list', 'assets/ui_list.png');
        this.load.image('ui_statuswindow', 'assets/ui_statusWindow.png');

        //console.log(Loader. + Loader.path);
        //choose what map you want by loading a different .json here.
        var tests = this.load.tilemapTiledJSON('gameMap', 'basicMap.json');

        //load the file which holds the HTML for our prompt.
        this.load.html("nameprompt", "prompt.html");


        //VARY THIS- contians all information for this level's initial state.
        this.registry.set('startingInfo', [
            {
                x: 5,
                y: 8,
                name: "Maya",
                side: 1
            },
            {
                x: 5,
                y: 3,
                name: "Slime",
                side: 0
            },
        ])

    }
    create()
    {
        this.scene.start('arenamap');
        this.scene.start('UIScene');
    }
}