import { Scene } from "phaser"
//import Tile from './TILE.png'
//import MapStuff from './basicMap.json'
//import Map2 from './basicMap.csv'

export default class Preloader1 extends Scene
{
    constructor()
    {
        super('preloader')
    }
    preload()
    {
        //BASE GAME ASSETS START ---
        this.load.image('tiles_in', 'assets/brick_tile.png');
        this.load.image('pointer', 'assets/indicator.png');
        this.load.image('target', 'assets/target.png');
        //load currently extant unit sprites:
        this.load.image('Maya', 'assets/Maya.png');
        this.load.image('Ivene', 'assets/Ivene.png');
        this.load.image('Slime', 'assets/Slime.png');
        this.load.image('Stollen', 'assets/Stollen.png');
        this.load.image('Mind Monolith', 'assets/BlueKnight.png');
        this.load.image('Power Monolith', 'assets/RedKnight.png');

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
        this.load.image('ui_statuswindow', 'assets/ui_statuswindow.png');

        //console.log(Loader. + Loader.path);
        //choose what map you want by loading a different .json here.
        var tests = this.load.tilemapTiledJSON('gameMap', 'map3.json');

        //load the file which holds the HTML for our prompt.
        this.load.html("nameprompt", "prompt.html");


        //VARY THIS- contians all information for this level's initial state.
        this.registry.set('startingInfo', [
            {
                x: 6,
                y: 7,
                name: "Maya",
                side: 1
            },
            {
                x: 8,
                y: 7,
                name: "Ivene",
                side: 1
            },
            {
                x: 4,
                y: 7,
                name: "Stollen",
                side: 1
            },
            {
                x: 8,
                y: 1,
                name: "Power Monolith",
                side: 0
            },
            {
                x: 3,
                y: 1,
                name: "Mind Monolith",
                side: 0
            }
        ])
        this.registry.set('cameraPos', {x: 6, y: 6});
        this.registry.set('levelNum', 3);

    }
    create()
    {
        this.scene.start('arenamap');
        this.scene.start('UIScene');
    }
}