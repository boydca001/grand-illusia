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
        //const tile = this.add.image(100, 100, 'grasstile');

        //this doesn't work and just constructs an generic empty map
        this.map = this.make.tilemap({key: 'basicMap'});
        //shown from this
        console.log(this.map);
        const tileset = this.map.addTilesetImage('JustGrass', 'grasstile');
        console.log(tileset);
        //...however, this DOES show the correct information.
        console.log(this.cache.tilemap.get('basicMap'));

        const layer = this.map.createLayer('toplayer', tileset, 0, 0);
        //this.cameras.main.setBounds(0,0, map.widthInPixels, map.heightInPixels, true);
        //this.cameras.main.scrollX -= map.widthInPixels/2;

        //center map??
        this.camXOffset = ((this.cameras.main.displayWidth)/2);
        this.camYOffset = (this.cameras.main.displayHeight)/2;
        const centerTile = layer.getTileAt(5,6);

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
        unitManager.addUnit(this, this.map, 5, 5    , "Maya", 1);

        //create enemies
        unitManager.addUnit(this, this.map, 5, 2, "Slime", 0);

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

        eventManager.on('ai_turn', this.AIAction)

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
            if (element.canAct)
            unitsCanAct.push(element)
        });

        //as i've not coded in any support abilities yet, so the ai will always take the aggressive approach.
        
    }

    postAction(unit)
    {
        unit.canAct = false;
        //any other things that may need to be resolved here
        stateManager.checkState();
    }

    highlightSelection(tiles)
    {
        tiles.forEach(element => {
            var targetTile = this.selectGroup.get(element.getCenterX(), element.getCenterY(), 'target');
            targetTile.setTexture('target');
            targetTile.visible = true;
            targetTile.active = true;
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
        var tilesInRange = getTilesInRadius(this.map.getTileAt(actingUnit.pos.x, actingUnit.pos.y), range + 1, this.map);
        this.targetedTiles = tilesInRange;

        this.highlightSelection(tilesInRange);

        //create a cancel button
        this.addCancelButton(actingUnit);
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
        // effectively disable this entire function if the UI scene is doing something, or if an animation is resolving.
        if(this.menuOn || stateManager.inAnimation)
        {
            return;
        }

        //if we're set to move, use this set of logic
        if (stateManager.selectMove)
        {
            var targetTile = this.map.getTileAtWorldXY(this.input.activePointer.worldX, this.input.activePointer.worldY + 32);
            //if this is the tile we're ALREADY standing on, ignore this.
            if (targetTile == this.map.getTileAt(this.targetingUnit.pos.x, this.targetingUnit.pos.y))
            {
                return;
            }
            //if we clicked a tile in range, go there
            if (this.targetedTiles.includes(targetTile))
            {
                console.log("Time to move.")
                stateManager.selectMove = false;
                stateManager.inAnimation = true;
                this.targetingUnit.moveTo(targetTile);

                //clean up the UI. TODO: abstract all calls to do this into a function so there isn't as much repeated code
                var children = this.selectGroup.getChildren()
                children.forEach(element => {
                    this.selectGroup.killAndHide(element);
                });
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
                var children = this.selectGroup.getChildren()
                children.forEach(element => {
                    this.selectGroup.killAndHide(element);
                });
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
            //this.cameras.main.setScroll(targetTile.getCenterX() - this.camXOffset, targetTile.getCenterY() - this.camYOffset);
            this.tweens.add(
                {
                    targets: this.cameras.main,
                    scrollX: targetTile.getCenterX() - this.camXOffset,
                    scrollY: targetTile.getCenterY() - this.camYOffset,
                    duration: 500,
                    ease : 'quad'
                }
            )
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
        //for now, everyone's move distance is 4. 5 just because of how getTilesInRadius calculates
        var targetedTiles = getTilesInRadius(center, 5, this.map);
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
        var cancel = this.selectGroup.get(300, 200, 'ui_prompt');
        cancel.setTexture('ui_prompt');
        cancel.visible = true;
        cancel.active = true;
        cancel.setScrollFactor(0);
        cancel.setScale(2);
        cancel.setInteractive();
        var cancelImg = this.selectGroup.get(300,200,'ui_cancel');
        cancelImg.setTexture('ui_cancel');
        cancelImg.visible = true;
        cancelImg.active = true;
        cancelImg.setScale(2);
        cancelImg.setScrollFactor(0);
        cancelImg.disableInteractive(0);
        console.log(this.selectGroup.getChildren())
        cancel.once('pointerdown', () => {
            stateManager.selectionMode = false;
            stateManager.selectMove = false;
            var children = this.selectGroup.getChildren();
            children.forEach(element => {
                this.selectGroup.killAndHide(element);
                element.removeAllListeners();
            });

            //take the camera back to the original unit
            var returnTile = this.map.getTileAt(returnUnit.pos.x, returnUnit.pos.y);
            this.tweens.add(
                {
                    targets: this.cameras.main,
                    scrollX: returnTile.getCenterX() - this.camXOffset,
                    scrollY: returnTile.getCenterY() - this.camYOffset,
                    duration: 500,
                    ease : 'quad'
                }
            )
            
            //go back into the menu.
            eventManager.emit('open-menu', returnUnit);
            this.input.stopPropagation();
        })
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
