import { Scene } from "phaser"
import unitManager from "@/resources/unitManager"
import stateManager from "@/resources/StateManager"
import { tileSearch, getTilesInRadius, moveDistance } from "@/resources/TileSearch.mjs"
import eventManager from "./eventManager";
import actionDict from "../units/actions.mjs";

export default class Arenamap extends Scene
{
    constructor()
    {
        super('arenamap')
    }
    preload()
    {
        //this.load.image('grasstile', 'TILE.png');
        //this.load.tilemapTiledJSON('themap', 'basicMap.json');
        this.load.image('grasstile', 'assets/TILE.png');

    };

    create()
    {
        // tell the state manager what level we're on
        stateManager.level = this.registry.get('levelNum');


        //Create our tilemap
        this.map = this.make.tilemap({key: 'gameMap'});

        //console.log(this.map);
        const tileset = this.map.addTilesetImage('map_tiles', 'tiles_in');
        console.log(tileset);
        // Connect the tileset to the map so it renders
        console.log(this.cache.tilemap.get('gameMap'));

        const layer = this.map.createLayer('toplayer', tileset, 0, 0);
        //this.cameras.main.setBounds(0,0, map.widthInPixels, map.heightInPixels, true);
        //this.cameras.main.scrollX -= map.widthInPixels/2;

        //center map??
        this.camXOffset = ((this.cameras.main.displayWidth)/2);
        this.camYOffset = (this.cameras.main.displayHeight)/2;
        var regCenter = this.registry.get('cameraPos')
        const centerTile = layer.getTileAt(regCenter.x,regCenter.y);

        //this.cameras.main.setScroll(centerTile.x - this.camXOffset,centerTile.y - this.camYOffset);

        this.cameras.main.setScroll(centerTile.getCenterX() - this.camXOffset,centerTile.getCenterY() - this.camYOffset);

        this.cameras.main.setZoom(1.5, 1.5);

        this.cameras.main.setBackgroundColor("#193b75");


        //create our controls
        this.cursors = this.input.keyboard.createCursorKeys();

        //Create a map cursor to indicate the current screen focus
        this.indic = this.makeCursor();
        this.indic.setPosition(centerTile.getCenterX(),centerTile.getCenterY());

        //create allies
        //unitManager.addUnit(this, this.map, 5, 5, "Maya", 1);
        //unitManager.addUnit(this, this.map, 5, 6, "Ivene", 1);

        //create enemies
        //unitManager.addUnit(this, this.map, 5, 2, "Slime", 0);
        //unitManager.addUnit(this, this.map, 7, 2, "Slime", 0);

        //Create units based on information provided by the preloader
        var initalUnits = this.registry.get('startingInfo');
        if (initalUnits == undefined)
        {
            throw new Error("Did not recieve a set of starting positions from preloader. Ensure this happens before the game loads.");
        }
        else
        {
            console.log(initalUnits);
            initalUnits.forEach(element => {
                unitManager.addUnit(this, this.map, element.x, element.y, element.name, element.side);
            });
        }

        //listener for clicking around
        this.input.on('pointerdown', this.goToClickedTile, this);

        //listener for the UI scene to check if the menu is open
        eventManager.on('menu_status', this.syncMenu, this);

        //listener for performing actions
        eventManager.on('doAction', this.resolveAction, this);

        stateManager.checkState(unitManager);

        this.menuOn = false;

        //listener for selecting an area for the use of a Skill
        eventManager.on('action', this.selectMode, this);

        //listener for selecting and performing movement
        eventManager.on('move', this.beginMove, this);

        //listener to resolve any post-action events
        eventManager.on('afterAction', this.postAction)

        eventManager.on('passTurn', this.passTurn, this);

        eventManager.on('ai_turn', this.AIAction, this);

        this.selectGroup = this.add.group({defaultKey: 'ui_prompt', classType: Phaser.GameObjects.Image});
        this.targetedTiles = [];
        this.targetSkill = "";
        this.targetingUnit = null;
    }

    //Begin the routine for the AI taking its turn.
    AIAction()
    {
        //select a random enemy unit that can act.
        var unitsCanAct = [];
        unitManager.enemyUnits.forEach(element => {
            if (element.canAct && element.props.hitPoints > 0 && !element.hasPassed)
            {
                unitsCanAct.push(element);
            }
        });


        if (unitsCanAct.length == 0)
        {
            //...All enemy units are either dead or passed their turn, so let's just end their turn.
            stateManager.actionCount = 0;
            this.postAction(this.targetingUnit);
            return;
        }


        //randomly choose one.
        this.targetingUnit = unitsCanAct[Math.floor(Math.random() * unitsCanAct.length)];

        //move the camera here, to focus attention.
        var enemyPos = this.map.getTileAt(this.targetingUnit.pos.x, this.targetingUnit.pos.y);
        this.panCamera(enemyPos.getCenterX(), enemyPos.getCenterY());

        //as i've not coded in any support abilities yet, so the ai will always take the aggressive approach.
        //find nearest ally.
        var activeAlly = null;
        var distance = null;
        unitManager.allyUnits.forEach(element => {
            //ignore defeated allies.
            if (element.props.hitPoints > 0)
            {
                var thisDistance = Math.sqrt(Math.pow(this.targetingUnit.pos.x - element.pos.x, 2) + Math.pow(this.targetingUnit.pos.y - element.pos.y, 2));
                if (distance == null || distance > thisDistance)
                {
                    distance = thisDistance;
                    activeAlly = element;
                }
                
            }
        });
        console.log("Selected: " + activeAlly.props.name);
        //step 1. choose randomly the ability you'd like to use.
        var randomInRange = (Math.random() * (this.targetingUnit.props.skills.length - 1));
        var chosenSkill = this.targetingUnit.props.skills[Math.round(randomInRange)];

        //step 2. is the target in range? every range in this game is diamond-shaped insofar, so we can just use manhattan distance.
        distance = Math.abs(this.targetingUnit.pos.x - activeAlly.pos.x) + Math.abs(this.targetingUnit.pos.y - activeAlly.pos.y);

        console.log(this.targetingUnit.props.skills.length);
        console.log(chosenSkill);
        if (distance <= actionDict[chosenSkill].range)
        {
            //we are in range now, so just use the skill and end your turn
            var startingTile = this.map.getTileAt(this.targetingUnit.pos.x, this.targetingUnit.pos.y);
            var targetsTile = this.map.getTileAt(activeAlly.pos.x, activeAlly.pos.y);
            var indicator = this.createSprite(startingTile.getCenterX(), startingTile.getCenterY(), 'target');
            var moveIndicator = this.tweens.add({
                targets: indicator,
                x: targetsTile.getCenterX(),
                y: targetsTile.getCenterY(),
                delay: 300,
                duration: 200,
                completeDelay: 1200,
                ease: 'elastic'

            })
            moveIndicator.once('complete', () => {
                console.log("Doing " + chosenSkill);
                actionDict[chosenSkill].activate(targetsTile, this.targetingUnit);
            })
        }
        else
        {
            //we are not in range, so try to get there
            //find all tiles that would allow you to be in range
            var allTilesInRange = getTilesInRadius(this.map.getTileAt(activeAlly.pos.x, activeAlly.pos.y), actionDict[chosenSkill].range, this.map);
            //filter out occupied tiles
            var openTiles = [];
            allTilesInRange.forEach(element => {
                if(unitManager.allyUnits.find(x => x.pos.x === element.x && x.pos.y === element.y) || unitManager.enemyUnits.find(x => x.pos.x === element.x && x.pos.y === element.y))
                {
                    //this tile is occupied by someone already. Omit it.
                }
                else
                {
                    //this tile is available, so add it to the real list
                    openTiles.push(element);
                }
                
            });

            //find path to the target. Out of all of our possible valid endpoints to use our skill, find the path to the shortest one.
            var fullPath = [];
            openTiles.forEach(element => {
                var tempPath = tileSearch(this.map.getTileAt(this.targetingUnit.pos.x, this.targetingUnit.pos.y), element);
                if (tempPath.length < fullPath.length || fullPath.length == 0)
                {
                    fullPath = tempPath;
                }
            });
            var willBeInRange = false;
            //since all units have a move distance of 4, we only ever use the first four entries of fullPath
            var path = fullPath.slice(0,4);
            //if we would arrive in range before travelling this full distance, then shorten the path - but only if no one is standing there.
            for (let index = 0; index < 3; index++) {
                //console.log(unitManager.findAt(path[index].x, path[index].y));
                if (openTiles.includes(path[index]) && unitManager.findAt(path[index].x, path[index].y) == 0)
                {
                    console.log("Good to go???")
                    path = path.slice(0, index + 1);
                    willBeInRange = true;
                    break;
                }
            }
            path.forEach(element => {
                if (openTiles.includes(element) && unitManager.findAt(element.x, element.y) == 0                                                                                                                                                                                            )
                {
                    console.log("Good to go???")
                    willBeInRange = true;
                }
            });
            console.log(openTiles);
            console.log(path);
            //temporary- just display the path.
            path.forEach(element => {
                element = this.createSprite(element.getCenterX(), element.getCenterY(), 'target');
            });
            this.time.delayedCall(900, () => {
                this.flushSelectGroup();
                this.targetingUnit.moveTo(path[path.length - 1]);

                var startingTile = this.map.getTileAt(this.targetingUnit.pos.x, this.targetingUnit.pos.y);
                var targetsTile = this.map.getTileAt(activeAlly.pos.x, activeAlly.pos.y);
                eventManager.once("completeAIturn", () => {
                    //if we won't get close enough to use our chosen skill in the first place, use the Pass skill and exit this routine.
                    if (!willBeInRange)
                    {
                        console.log("Still out of range. Passing.");
                        actionDict['Pass'].activate(targetsTile, this.targetingUnit);
                        return;
                    }
                    var newpos = this.map.getTileAt(this.targetingUnit.pos.x, this.targetingUnit.pos.y);
                    this.panCamera(newpos.getCenterX(), newpos.getCenterY());
                    var indicator = this.createSprite(startingTile.getCenterX(), startingTile.getCenterY(), 'target');
                    var moveIndicator = this.tweens.add({
                        targets: indicator,
                        x: targetsTile.getCenterX(),
                        y: targetsTile.getCenterY(),
                        delay: 600,
                        duration: 300,
                        completeDelay: 1200,
                        ease: 'elastic'

                    })
                    moveIndicator.once('complete', () => {
                        this.flushSelectGroup();
                        console.log("Doing " + chosenSkill);
                        actionDict[chosenSkill].activate(targetsTile, this.targetingUnit);
                    })
                })
            })

        }

    }

    // Helper function to allow the player to voluntarily pass their turn.
    passTurn(unit)
    {
        var tile = this.map.getTileAt(unit.pos.x, unit.pos.y);
        actionDict['Pass'].activate(tile, unit);
    }

    postAction(unit)
    {
        unit.canAct = false;
        //any other things that may need to be resolved here

        //after every action, check if any unit has been defeated and tint them a dark color to indicate that.
        unitManager.allyUnits.forEach((element) => {
            if (element.props.hitPoints == 0)
            {
                element.image.setTint(0x404040);
                element.canAct = false;
                element.canMove = false;
            }
        })
        unitManager.enemyUnits.forEach((element) => {
            if (element.props.hitPoints == 0)
            {
                element.image.setTint(0x404040);
                element.canAct = false;
                element.canMove = false;
            }
        })
        stateManager.actionCount -= 1;
        stateManager.checkState();
    }

    highlightSelection(tiles)
    {
        tiles.forEach(element => {
            var targetTile = this.createSprite(element.getCenterX(), element.getCenterY(), 'target');
            targetTile.setScrollFactor(1);
            targetTile.setScale(1);
            targetTile.disableInteractive();
        });
    }

    selectMode(actingUnit, skillName)
    {
        stateManager.selectionMode = true;
        // ... TODO:
        // use the current skill designated for use along with functions in the various
        // helpers to place a preview of the tiles you are allowed to select to target

        //get the skill's range first
        var range = actionDict[skillName].range;
        this.targetSkill = skillName;

        //use that range to highlight all selectable tiles. we also need to keep track of this
        //because these same tiles are the ones that the player will be allowed to click to target
        var tilesInRange = getTilesInRadius(this.map.getTileAt(actingUnit.pos.x, actingUnit.pos.y), range, this.map);
        this.targetedTiles = tilesInRange;

        this.highlightSelection(tilesInRange);

        //create a cancel button
        this.addCancelButton(actingUnit);
    }

    changeTurn(whosTurn)
    {
        
    }

    syncMenu(menuStatus)
    {
        this.menuOn = menuStatus;
    }

    update()
    {
        
    }

    goToClickedTile()
    {
        // effectively disable this entire function if the UI scene is doing something, or if an animation is resolving. Or if the game is over.
        if(this.menuOn || stateManager.inAnimation || stateManager.gameOver)
        {
            return;
        }

        

        //if we're set to move, use this set of logic
        if (stateManager.selectMove)
        {
            var targetTile = this.map.getTileAtWorldXY(this.input.activePointer.worldX, this.input.activePointer.worldY + 32);
            //if this is the tile we're ALREADY standing on, ignore this. Also ignore off-map clicks.
            if (targetTile == this.map.getTileAt(this.targetingUnit.pos.x, this.targetingUnit.pos.y) || targetTile == null)
            {
                return;
            }
            // do not allow the player to move a unit onto a tile a unit is already standing.
            if (unitManager.findAt(targetTile.x, targetTile.y) != 0)
            {
                return;
            }
            //if we clicked a tile in range, go there
            if (this.targetedTiles.includes(targetTile))
            {
                var route = tileSearch(this.map.getTileAt(this.targetingUnit.pos.x, this.targetingUnit.pos.y), targetTile);
                //if the route doesn't exist, don't continue.
                if (route.length == 0)
                {
                    return;
                }
                this.targetingUnit.moveTo(targetTile);
                this.targetingUnit.canMove = false;
                console.log("Time to move.")
                stateManager.selectMove = false;
                stateManager.inAnimation = true;    

                //clean up the UI. TODO: abstract all calls to do this into a function so there isn't as much repeated code
                this.flushSelectGroup();
            }
            return;
        }
        //break to different logic if we're in select mode
        if(stateManager.selectionMode)
        {

            //don't keep selecting if we already have!
            if(stateManager.confirmationMode)
            {
                return;
            }
            //... TODO:
            // check if we're clicking one of the tiles that should be highlighted by selectMode()
            // and if so, go to the confirmation screen. ideal - selectMode() also produces an
            // onscreen cancel button which should stopPropagation and reopen the menu
            var targetTile = this.map.getTileAtWorldXY(this.input.activePointer.worldX, this.input.activePointer.worldY + 32);
            console.log(this.targetedTiles.includes(targetTile));
            if (this.targetedTiles.includes(targetTile))
            {
                //we can proceed with confirmation/activation.
                stateManager.confirmationMode = true;
                eventManager.emit('confirm', {skill : this.targetSkill, tile : targetTile});
                //clean up this UI
                this.flushSelectGroup();
            }

            return;
        }
        //if it is not your turn, this does nothing!
        if (!stateManager.isPlayerTurn)
        {
            return;
        }
        var targetTile = this.map.getTileAtWorldXY(this.input.activePointer.worldX, this.input.activePointer.worldY + 32);

        if (targetTile == null)
        {
            console.log("No tile found, but the cursor is at " + this.input.activePointer.worldX +", " + this.input.activePointer.worldY);
        }
        else
        {
            console.log("Going to tile (" + targetTile.x + ", " + targetTile.y + ") at " + targetTile.pixelX + ", " + targetTile.pixelY + "(cursor at " +  this.input.activePointer.worldX +", " + this.input.activePointer.worldY+ ")");

            this.panCamera(targetTile.getCenterX(), targetTile.getCenterY());
            
            this.tweens.add(
                {
                    targets: this.indic,
                    x: targetTile.getCenterX(),
                    y: targetTile.getCenterY(),
                    duration: 180,
                    ease: 'quad'
                }
            )
            var foundUnit = unitManager.findAt(targetTile.x, targetTile.y);
            if (foundUnit)
            {
                eventManager.emit('open-menu', foundUnit);
                console.log("Opening menu from main game.")
                this.tweens.add(
                    {
                        targets: this.cameras.main,
                        zoom: 1.6,
                        duration: 300,
                        ease : 'quad'
                    }
                )
            }
            else
            {
                this.tweens.add(
                    {
                        targets: this.cameras.main,
                        zoom: 1.5,
                        duration: 300,
                        ease : 'quad'
                    }
                )
            }
        }
    }

    resolveAction(input)
    {
        stateManager.inAnimation = true;
        console.log(input);
        actionDict[input.skillName].activate(input.tile, input.unit);
    }

    beginMove(targetUnit)
    {
        var center = this.map.getTileAt(targetUnit.pos.x, targetUnit.pos.y);
        //for now, everyone's move distance is 4.
        var targetedTiles = getTilesInRadius(center, 4, this.map);
        this.targetedTiles = targetedTiles;
        this.highlightSelection(targetedTiles);

        this.addCancelButton(targetUnit);
        this.targetingUnit = targetUnit;
        stateManager.selectMove = true;
    }

    makeCursor()
    {
        const cursor = this.add.image(0,0, 'pointer');
        return cursor;
    }

    //Create a button to cancel the current operation.
    //@returnUnit: The unit whose position the camera should return to upon being selected.
    addCancelButton(returnUnit)
    {
        //create a cancel button
        var cancel = this.createSprite(300, 200, 'ui_prompt', true);
        cancel.setScrollFactor(0);
        cancel.setScale(2);
        var cancelImg = this.createSprite(300,200,'ui_cancel');
        cancelImg.setScale(2);
        cancelImg.setScrollFactor(0);
        cancel.once('pointerdown', () => {
            console.log("Cancel button callback.");
            stateManager.selectionMode = false;
            stateManager.selectMove = false;
            this.flushSelectGroup();

            //take the camera back to the original unit
            var returnTile = this.map.getTileAt(returnUnit.pos.x, returnUnit.pos.y);
            this.panCamera(returnTile.getCenterX(), returnTile.getCenterY());
            
            //go back into the menu.
            eventManager.emit('open-menu', returnUnit);
            this.input.stopPropagation();
        })
    }

    //remove all images in the select group from the screen. Used to clean up any images used to indicate targeting
    flushSelectGroup()
    {
        var children = this.selectGroup.getChildren()
        children.forEach(element => {
            this.selectGroup.killAndHide(element);
            element.removeAllListeners();
        });
    }

    //pans the camera to the position indicated by targetX, targetY.
    panCamera(targetX, targetY, time = 500, ease = 'quad')
    {
        this.tweens.add(
            {
                targets: this.cameras.main,
                scrollX: targetX - this.camXOffset,
                scrollY: targetY - this.camYOffset,
                duration: time,
                ease : ease
            }
        )
    }

    //Creates a sprite on the screen. Defaults to selectGroup for HUD convience, but group may be specified
    //to use a different one instead.
    createSprite(x, y, key = '', isInteractive = false, group = this.selectGroup)
    {
        var sprite = group.get(x, y, key)
        // Group.get() does NOT assign any properties other than position if it can acquire an existing
        // Sprite object. Therefore, all of these properies need to be reset just in case
        sprite.setTexture(key);
        sprite.visible = true;
        sprite.active = true;
        if (isInteractive)
        {
            sprite.setInteractive();
        }
        else
        {
            sprite.removeInteractive();
        }
        return sprite;
    }
    /*
    windows = [];
    openMenu()
    {
        var theTile = this.map.getTileAt(5,6);
        if(this.menuOn == false)
        {
            for (let index = 0; index < 3; index++) {
                const element = this.menuGroup.get(32, ((index * 48) + 24), 'ui_prompt');
                element.setScrollFactor(0);
                element.active = true;
                element.visible = true;
            }
            this.menuOn = true;
            console.log("Opening menu.");
        }
        else
        {
            var members = this.menuGroup.getChildren();
            members.forEach(element => {
                this.menuGroup.killAndHide(element);
            });
            this.menuOn = false;
            console.log("Hiding menu.");
        }
        
    }
    */
}
