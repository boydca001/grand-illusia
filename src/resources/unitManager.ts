import { Scene } from 'phaser'
import Unit from '../resources/units/baseUnit.mjs'
import UnitDict from "../resources/units/units.mjs"


class MapUnit
{
    public props:Unit;
    public pos = {
        x: 0,
        y: 0
    }
    public canAct:boolean = true;
    public image:Phaser.GameObjects.Sprite;
    constructor(unitName: string, xIn:number, yIn:number, img:Phaser.GameObjects.Sprite)
    {
        this.props = {...UnitDict[unitName]};
        if (this.props == null || this.props == undefined)
        {
            throw new Error("Failed to create a unit of type '"+unitName+"'.");
        }
        this.image = img;
        this.image.setOrigin(0.5, 0.8);
        this.pos = {
            x: xIn,
            y: yIn
        };

    }
}
//ar testvar:Unit = new Unit({...UnitDict["Maya"]});

export default class UnitManager
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
        var found = false;
        this.allyUnits.forEach(element => {
            if (element.pos.x == x && element.pos.y == y)
            {
                console.log("Allied unit " + element.props.name + " found at " + x + ", " + y + ".");
                console.log(element);
                found = true;
                return element;

            }
        });
        this.enemyUnits.forEach(element => {
            if (element.pos.x == x && element.pos.y == y)
            {
                console.log("Enemy unit " + element.props.name + " found at " + x + ", " + y + ".");
                found = true;
                return element;
            }
        });
        if (found == false) {console.log("No unit found at " + x + ", " + y + ".");}
    }
}


