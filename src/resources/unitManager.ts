import { Scene } from 'phaser'
import Unit from '../resources/units/baseUnit.mjs'
import UnitDict from "../resources/units/units.mjs"
import { tileSearch } from './TileSearch.mjs';
import stateManager from './StateManager';
import eventManager from './scenes/eventManager';


class MapUnit
{
    public props:Unit;
    public pos = {
        x: 0,
        y: 0
    }
    public canAct:boolean = true;
    public canMove:boolean = true;
    public image:Phaser.GameObjects.Sprite;
    constructor(unitName: string, xIn:number, yIn:number, img:Phaser.GameObjects.Sprite)
    {
        //there's nothing actually wrong with the below line, typescript is just being weird
        this.props = {...UnitDict[unitName]};
        if (this.props == null || this.props == undefined)
        {
            throw new Error("Failed to create a unit of type '"+unitName+"'.");
        }
        this.image = img;
        this.image.setOrigin(0.5, 0.8);
        this.image.setDepth(1);
        this.pos = {
            x: xIn,
            y: yIn
        };
    }

    moveTo(destTile: Phaser.Tilemaps.Tile)
    {
        var startTile = destTile.tilemap?.getTileAt(this.pos.x, this.pos.y);
        var route = tileSearch(startTile, destTile);
        //everyone's move distance is 4.
        var routeSliced = route.slice(0, 4);
        //construct the individual tweens that will make up the timeline
        var tweens = [];
        routeSliced.forEach(element => {
            tweens.push({
                targets: this.image,
                x: element.getCenterX(),
                y: element.getCenterY(),
                duration: 120,
                ease: 'quad'
            })
        });
        var timeline = this.image.scene.tweens.chain({tweens: tweens,
        onComplete: () => {stateManager.inAnimation = false;
        eventManager.emit("completeAIturn")}});
        this.pos.x = routeSliced[routeSliced.length - 1].x;
        this.pos.y = routeSliced[routeSliced.length - 1].y;
    }
}
//ar testvar:Unit = new Unit({...UnitDict["Maya"]});

class UnitManager
{
    public allyUnits:MapUnit[] = [];
    public enemyUnits:MapUnit[] = [];
    constructor()
    {
        
    }

    //creates a given unit of specified 'type' on tile x, y in scene, on isAlly's side.
    addUnit(scene : Scene, map : Phaser.Tilemaps.Tilemap, x : number, y : number, type : string, isAlly : boolean)
    {
        var targetTile = map.getTileAt(x, y);
        if (targetTile == null)
        {
            throw new Error("Tried to create a unit at nonexistent tile " + x + ", " + y);
        }
        const unit = new MapUnit(type, x, y, scene.add.sprite(targetTile.getCenterX(), targetTile.getCenterY(), type));
        if (isAlly)
        {
            this.allyUnits.push(unit);
        }
        else
        {
            this.enemyUnits.push(unit);
        }
    }

    findAt(x:number, y:number)
    {
        var foundUnit = null;
        this.allyUnits.forEach(element => {
            if (element.pos.x == x && element.pos.y == y)
            {
                console.log("Allied unit " + element.props.name + " found at " + x + ", " + y + ".");
                foundUnit = element;

            }
        });
        this.enemyUnits.forEach(element => {
            if (element.pos.x == x && element.pos.y == y)
            {
                console.log("Enemy unit " + element.props.name + " found at " + x + ", " + y + ".");
                foundUnit = element;
            }
        });
        if (foundUnit == null) 
        {
            console.log("No unit found at " + x + ", " + y + ".");
            return 0;
        }
        else
        {
            return foundUnit;
        }
    }
}

const unitManager = new UnitManager;

export default unitManager;
