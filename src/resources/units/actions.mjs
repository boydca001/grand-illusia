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
    console.log("Creating damage FX with value " + amount);
    var damageNumber = tile.tilemap.scene.add.text(tile.getCenterX(), tile.getCenterY() - 30, Math.abs(amount))
    damageNumber.setDepth(10);
    damageNumber.setOrigin(0.5, 0.5);
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

function updateScoreByDamage(unit, damage)
{
    if (unitManager.enemyUnits.includes(unit))
    {
        stateManager.score.damageDealt += -damage;
    }
    else
    {
        stateManager.score.damageTaken -= -Math.floor(damage / 2);
    }
    if (damage >= unit.props.maxHitPoints)
    {
        stateManager.score.effectiveHits += 10;
    }
}

const actionDict = {

    "Pass" : new BaseAction ({
        name: "Pass",
        desc: "Do nothing. You cannot get another turn during this round, but your side will regain 0.5 AP.",
        cost: 0,
        range: 0,
        activate: (tile, unit) => {
            //Pass only needs to resolve the things that should occur at the end of anybody's action.
            stateManager.actionCount += 0.5;
            unit.hasPassed = true;
            tile.tilemap.scene.time.delayedCall(500, () => {eventManager.emit('afterAction', unit)});
        },
        targets: TARGETS_SELF
    }),
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
                    var damage = Math.ceil(unit.props.attack * 3 * normalSpread());
                    console.log(target);
                    console.log(target.props);
                    var finalDamage = target.props.takeDamage(1, damage);
                    updateScoreByDamage(target, finalDamage);
                    console.log(finalDamage + " damage to " + target.props.name + "!");
                    damageFX(tile, finalDamage);
                }
                else
                {
                    console.log("(No unit exists at the targeted tile)");
                }
                
                fx.destroy();
                stateManager.inAnimation = false;
                eventManager.emit("afterAction", unit);
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
                console.log("This is running");
                if (target != 0)
                {
                    console.log("and so is this ");
                    var damage = Math.ceil(unit.props.attack * 2 * normalSpread());
                    var finalDamage = target.props.takeDamage(1, damage);
                    updateScoreByDamage(target, finalDamage);
                    if (target.props.hitPoints < 0)
                    console.log(finalDamage + " damage to " + target.props.name + "!");
                    damageFX(tile, finalDamage);
                }
                else
                {
                    console.log("(No unit exists at the targeted tile)");
                }
                fx.destroy();
                stateManager.inAnimation = false;
                eventManager.emit("afterAction", unit);
            })
            fx.play("bounce");
        },
        targets: TARGETS_ENEMY
    }),

    "Water Sphere" : new BaseAction({
        name: 'Water Sphere',
        desc: "A magical attack which uses water. It can be used from a distance. Costs 15 MP.",
        cost: 15,
        range: 4,
        activate: (tile, unit) => {
            var scene = tile.tilemap.scene;
            var fx = scene.add.particles(unit.image.x, unit.image.y - 30, 'watersphere', {
                /*frame: 'watersphere',*/
                lifespan: 2000,
                speed: { min: 200, max: 200 },
                scale: { start: 0.7, end: 0},
                blendMode: 'ADD'
            });
            fx.setDepth(10);

            var target = unitManager.findAt(tile.x, tile.y);
            scene.tweens.add({
                targets: fx,
                x: tile.getCenterX(),
                y: tile.getCenterY() - 30,
                duration: 2000,
                completeDelay: 1000,
                ease: 'Expo.easeIn',
                onComplete: () => {
                    if (target != 0)
                    {
                        var damage = Math.ceil(unit.props.force * 4 * normalSpread());
                        var finalDamage = target.props.takeDamage(2, damage);
                        updateScoreByDamage(target, finalDamage);
                        console.log(finalDamage + " damage to " + target.props.name + "!");
                        damageFX(tile, finalDamage);
                        fx.explode(10);
                        fx.destroy();
                        stateManager.inAnimation = false;
                        eventManager.emit("afterAction", unit);
                    }

                }

            })
        },
        targets: TARGETS_ENEMY
    })
}
export default actionDict;