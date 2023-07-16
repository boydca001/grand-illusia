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
        this.load.image('grasstile', 'assets/TILE.png');
        this.load.image('pointer', 'assets/indicator.png');
        this.load.image('target', 'assets/target.png');
        //load currently extant unit sprites:
        this.load.image('Maya', 'assets/Maya.png');
        this.load.image('Slime', 'assets/Slime.png');

        //load anything related to animations.
        this.load.spritesheet('sk_strike', 'assets/sk_strike.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('sk_bounce', 'assets/sk_bounce.png', {frameWidth: 64, frameHeight: 64});

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
        var tests = this.load.tilemapTiledJSON('basicMap', 'basicMap.json');
        //console.log(tests);
        var defaultAnim = {
            key : "sk_default",
            frames : "sk_strike",
            frameRate : 10,
            repeat : -1
        }

    }
    create()
    {
        this.scene.start('arenamap');
        this.scene.start('UIScene');
    }
}