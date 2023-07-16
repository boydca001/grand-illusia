import BaseAction from "./baseAction.mjs";
import Unit from "./baseUnit.mjs"
import unitManager from "../unitManager"
import { Scene } from "phaser"
import stateManager from "../StateManager";
import animationDict from "./animationDict.mjs"
import eventManager from "../scenes/eventManager";

const TARGETS_ENEMY = 0;
const TARGETS_ALLY = 1;
const TARGETS_SELF = 2;

//Targeting range constants

// One target.
const ONE = 0;
// A cross of 5 tiles, centered on the target.
const CROSS = 1;
// All units in range. On supportive effects, generally only targets allies.
const ALL = 2;

//returns a number to modify the damage spread of attacks from 80% power to 110% power. Add some randomness!
function normalSpread()
{
    var base = Math.floor(Math.random() * 31) - 20;
    return ((100 + base) / 100);
}

//create a damage number over the tile of the unit that the damage was dealt to.
function damageFX(tile, amount)
{
    var damageNumber = tile.tilemap.scene.add.text(tile.getCenterX() - 8, tile.getCenterY() - 30, amount)
    var tween = tile.tilemap.scene.tweens.add({
        targets: damageNumber,
        y: damageNumber.y-30,
        duration: 600,
        completeDelay: 700,
        ease: 'bounce'
    })
    tween.once('complete', () => {
        damageNumber.destroy();
    })
}

const actionDict = {
    "Strike" : new BaseAction ({
        name: "Strike",
        desc: "A basic attack. It deals damage to an adjacent unit.",
        cost: 0,
        range: 1,
        activate: (tile, unit) => {
            console.log("Attacking!");
            var scene = tile.tilemap.scene;
            var fx = scene.add.sprite(tile.getCenterX(), tile.getCenterY() - 20);
            fx.setDepth(1);
            fx.anims.create(animationDict["Strike"]);
            fx.on('animationcomplete', () => {
                var target = unitManager.findAt(tile.x, tile.y);
                if (target != 0)
                {
                    var damage = Math.ceil(unit.props.attack * 3 * normalSpread()) - target.props.defense;
                    target.props.hitPoints -= damage;
                    if (target.props.hitPoints < 0)
                    {
                        target.props.hitPoints = 0;
                    }
                    console.log(damage + " damage to " + target.props.name + "!");
                    damageFX(tile, damage);
                    eventManager.emit("afterAction", unit);
                }
                else
                {
                    console.log("(No unit exists at the targeted tile)");
                }
                
                fx.destroy();
                stateManager.inAnimation = false;
            })
            fx.play('strike');
        },
        targets: TARGETS_ENEMY
    }

    ),

    "Bounce" : new BaseAction({
        name: "Bounce",
        desc: "A simple attack. Slime-like enemies like to use it.",
        cost: 0,
        range: 1,
        activate: (tile, unit) => {
            var scene = tile.tilemap.scene;
            var fx = scene.add.sprite(tile.getCenterX(), tile.getCenterY() - 20);
            fx.setDepth(1);
            fx.anims.create(animationDict["Bounce"]);
            fx.on('animationcomplete', () => {
                var target = unitManager.findAt(tile.x, tile.y);
                if (target != 0)
                {
                    var damage = Math.ceil(unit.props.attack * 2 * normalSpread()) - target.props.defense;
                    target.props.hitPoints -= damage;
                    if (target.props.hitPoints < 0)
                    {
                        target.props.hitPoints = 0;
                    }
                    console.log(damage + " damage to " + target.props.name + "!");
                    damageFX(tile, damage);
                    eventManager.emit("afterAction", unit);
                }
                else
                {
                    console.log("(No unit exists at the targeted tile)");
                }
                
                fx.destroy();
                stateManager.inAnimation = false;
            })

        },
        targets: TARGETS_ENEMY
    })
}
export default actionDict;