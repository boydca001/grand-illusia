import test from "@/pages/playtest";
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
        //load currently extant unit sprites:
        this.load.image('Maya', 'assets/Maya.png');
        this.load.image('Slime', 'assets/Slime.png')
        //console.log(Loader. + Loader.path);
        var tests = this.load.tilemapTiledJSON('basicMap', 'basicMap.json');
        //console.log(tests);

    }
    create()
    {
        this.scene.start('arenamap');
    }
}