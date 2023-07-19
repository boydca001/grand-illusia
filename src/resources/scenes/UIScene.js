import { Scene } from "phaser"
import eventManager from "./eventManager";
import unitManager from "../unitManager";
import stateManager from "../StateManager";
import actionDict from "@/resources/units/actions.mjs"

export default class UIScene extends Scene
{
    constructor()
    {
        super('UIScene')
    }

    preload()
    {

    }

    create()
    {
        // ***
        //      RETROSPECTIVE
        // ***
        // In reality there really is no reason to have so many groups unless some of them should be getting
        // disabled or emptied when other ones shouldn't. In the future, this should PROBABLY just be refactored
        // to just one group for images and another for text - or - one for UI boxes, another for images, and another for text.
        this.menuGroup = this.add.group({defaultKey: "ui_prompt", classType : Phaser.GameObjects.Sprite});
        this.menuIconGroup = this.add.group({defaultKey: "ui_action", classType : Phaser.GameObjects.Image});
        this.menuTextGroup = this.add.group({classType: Phaser.GameObjects.Text});

        this.actionGroup = this.add.group({defaultKey: "ui_list", classType : Phaser.GameObjects.Image});
        this.actionTextGroup = this.add.group({classType: Phaser.GameObjects.Text});

        eventManager.on('showturnprompt', this.turnPrompt, this);

        eventManager.on('open-menu', this.takeFocus, this);
        this.menuOn = false;
        this.currentMenu = "";
        this.UIClicked = false;

        eventManager.on('gameEnd', ()=>{this.time.delayedCall(1000, this.showEndScreen, [stateManager.victoryState], this)}, this);

        this.input.on('pointerdown', this.selectOnMenu, this);
        eventManager.on('confirm', this.openConfirmation, this);
        this.currentUnit = null;

        this.scaleFactor = 2; //generally what i think a good scale for the UI is

        this.scoreCounter = this.add.text(this.cameras.main.displayWidth, 0, "", {fontFamily: '"Courier New"', fontSize: 30, color: "#60c700"})
        this.scoreCounter.setOrigin(1,0);

        this.turnCounter = this.add.text(this.cameras.main.displayWidth, 40, "", {fontFamily: '"Courier New"', fontSize: 30, color: "#60c700"})
        this.turnCounter.setOrigin(1,0);

        this.actionCounter = this.add.text(this.cameras.main.displayWidth, 80, "", {fontFamily: '"Courier New"', fontSize: 30, color: "#60c700"})
        this.actionCounter.setOrigin(1,0);
    }

    update()
    {
        this.scoreCounter.setText("Score: " + (stateManager.score.damageDealt + stateManager.score.timeBonus + stateManager.score.damageTaken + stateManager.score.effectiveHits))
        this.turnCounter.setText("Turn " + stateManager.turnCount);
        this.actionCounter.setText("Remaining Actions: " + stateManager.actionCount);
    }

    showEndScreen(winner)
    {
        //create large main background prompt
        var backScreen = this.createSprite(this.cameras.main.displayWidth/2, this.cameras.main.displayHeight/2, 'ui_statuswindow');
        backScreen.setScale(3);
        var victoryText = this.createText(backScreen.x, backScreen.y - 160, "LEVEL COMPLETE!")
        if (winner == -1)
        {
            backScreen.setText("Try Again Next Time...!");
        }
        victoryText.setFontSize(36);
        victoryText.setOrigin(0.5,0.5);
        var scoreHeader = this.createText(backScreen.x - 300, backScreen.y - 140, "Your Score:")
        scoreHeader.setFontSize(24);
        var scoreDamage = this.createText(backScreen.x - 250, backScreen.y - 100, "Damage Dealt : " + stateManager.score.damageDealt);
        scoreDamage.setFontSize(24);
        var scoreTaken = this.createText(backScreen.x - 250, backScreen.y - 60, "Damage Taken : " + stateManager.score.damageTaken);
        scoreTaken.setFontSize(24);
        var scoreEffective = this.createText(backScreen.x - 250, backScreen.y - 20, "Effective Hits : " + stateManager.score.effectiveHits);
        scoreEffective.setFontSize(24);
        var scoreTurns = this.createText(backScreen.x - 250, backScreen.y + 20, "Turn Bonus : " + stateManager.score.timeBonus);
        scoreTurns.setFontSize(24);
        var scoreFinal = this.createText(backScreen.x - 230, backScreen.y + 70, "Final Score : " + (stateManager.score.damageDealt + stateManager.score.timeBonus + stateManager.score.damageTaken + stateManager.score.effectiveHits));
        scoreFinal.setFontSize(30);
        var textprompt = this.add.dom(backScreen.x - 250, backScreen.y + 200).createFromCache('nameprompt');
        textprompt.setOrigin(0, 0);

        //allow the user to input their info.
        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.returnKey.on("down", event => {
            let name = textprompt.getChildByName("name");
            if(name.value != "") {
                stateManager.sendPlayerScore(name.value);
                name.value = "";
                this.returnKey.removeAllListeners();
                var confirmation = this.createText(textprompt.x, textprompt.y + 40, "Your score has been added! (Refresh the page to see!)")
                confirmation.setFontSize(20)
                textprompt.destroy();
            }
        });
        
    }

    isMenuOpen()
    {
        return this.menuOn;
    }

    //take sole control of the screen and open the main menu.
    takeFocus(selectedUnit)
    {
        this.openMenu(selectedUnit);
        eventManager.emit('menu_status', this.menuOn);
    }

    //Create a visual prompt as to the changing of turns.
    turnPrompt()
    {
        stateManager.inAnimation = true;
        var backScreen = this.createSprite(-100, this.cameras.main.displayHeight/2, 'ui_prompt');
        backScreen.setScale(2.5);
        var turnText = this.createText(backScreen.x, backScreen.y, "");
        turnText.setFontSize(16);
        turnText.setOrigin(0.5, 0.5);
        if (stateManager.isPlayerTurn)
        {
            turnText.setText("- PLAYER TURN! -");
        }
        else
        {
            turnText.setText("- ENEMY TURN -");
        }
        // Tweens for moving these prompts on and off the screen
        var tweens = [];
        tweens.push({
            targets: [backScreen, turnText],
            x: this.cameras.main.displayWidth/2,
            duration: 600,
            completeDelay: 800,
            ease: 'quad'
        })
        tweens.push({
            targets: [backScreen, turnText],
            x: this.cameras.main.displayWidth + 100,
            duration: 600,
            ease: 'quad'
        })
        var timeline = this.tweens.chain({tweens: tweens, 
            onComplete: () => {
                this.closeMenu();
                stateManager.inAnimation = false;
            }
        })
    }

    //handles opening the game's menu, and provides the UI with context on the unit the player is looking at with the cursor.
    openMenu(selectedUnit = null)
    {

        if(this.menuOn == false)
        {
            //the menu isn't open, so open it and tell the game scene not to do anything in the meantime.
            if(selectedUnit != null)
            {
                this.currentUnit = selectedUnit;
            }
            else
            {
                selectedUnit = this.currentUnit;
            }
            if (unitManager.allyUnits.includes(selectedUnit))
            {
                // this is an ally unit, so we get more options on the menu for them
                for (let index = 0; index < 4; index++) {
                    const element = this.createSprite(32 * this.scaleFactor, ((index * 48) + 24) * this.scaleFactor, 'ui_prompt', true);
                    element.setScrollFactor(0);
                    element.setScale(2);
                    if (index == 0)
                    {
                        var icon = this.menuIconGroup.get(element.x, element.y, 'ui_action');
                        if (this.currentUnit.canAct && !this.currentMenu.hasPassed)
                        {
                            element.once('pointerdown', this.openActions,);
                            icon.setTexture('ui_action');
                        }
                        else
                        {
                            icon.setTexture('ui_cancel');
                        }
                        icon.setScrollFactor(0);
                        icon.setScale(1.75);
                        icon.active = true;
                        icon.visible = true;
                    }
                    if (index == 1)
                    {
                        var icon = this.menuIconGroup.get(element.x, element.y, 'ui_move');
                        if (this.currentUnit.canMove == true && !this.currentMenu.hasPassed)
                        {
                            element.once('pointerdown', this.openMove);
                            icon.setTexture('ui_move');
                        }
                        else
                        {
                            icon.setTexture('ui_cancel');
                        }
                        icon.setScrollFactor(0);
                        icon.setScale(1.75);
                        icon.active = true;
                        icon.visible = true;
                    }
                    if (index == 2)
                    {
                        element.once('pointerdown', this.openStatus);
                        var icon = this.menuIconGroup.get(element.x, element.y, 'ui_status');
                        icon.setTexture('ui_status');
                        icon.setScrollFactor(0);
                        icon.setScale(1.75);
                        icon.active = true;
                        icon.visible = true;
                    }
                    if (index == 3)
                    {
                        var passText = this.createText(element.x, element.y, "PASS")
                        passText.setOrigin(0.5, 0.5);
                        passText.setFontSize(28);
                        if (!this.currentUnit.hasPassed)
                        {
                            element.once('pointerdown', () => {
                                eventManager.emit('passTurn', selectedUnit);
                                this.yield();
                            })
                        }
                        else
                        {
                            var icon = this.menuIconGroup.get(element.x, element.y, 'ui_cancel');
                            icon.setScrollFactor(0);
                            icon.setScale(1.75);
                            icon.active = true;
                            icon.visible = true;
                        }
                    }

                }
            }
            else
            {
                //this is an enemy/other unit. only display their stats
                const element = this.createSprite(32 * this.scaleFactor, ((3 * 48) + 24) * this.scaleFactor, 'ui_prompt', true);
                element.setScrollFactor(0);
                element.setScale(2);

                element.once('pointerdown', this.openStatus);
                var icon = this.menuIconGroup.get(element.x, element.y, 'ui_status');
                icon.setTexture('ui_status');
                icon.setScrollFactor(0);
                icon.setScale(1.75);
                icon.active = true;
                icon.visible = true;
            }

            //make the info bar at the bottom. everyone sees this no matter what
            var infoBar = this.createSprite(512, 702, 'ui_info');
            infoBar.setScale(2);
            var infoName = this.createText(infoBar.x - 200, infoBar.y - 50, selectedUnit.props.name, {fontFamily: '"Courier New"', fontSize: 30});
            infoName.setFontSize(30);
            infoName.setText(selectedUnit.props.name);
            infoName.visible = true;
            infoName.active = true;
            var infoHP = this.createText(infoBar.x - 90, infoBar.y + 35, selectedUnit.props.hitPoints, {fontFamily: '"Courier New"', fontSize: 20});
            infoHP.setText("HP: " + selectedUnit.props.hitPoints + " / " + selectedUnit.props.maxHitPoints);
            infoHP.visible = true;
            infoHP.active = true;
            var infoMP = this.createText(infoBar.x + 50, infoBar.y + 35, selectedUnit.props.magicPoints, {fontFamily: '"Courier New"', fontSize: 20});
            infoMP.setText("MP: " + selectedUnit.props.magicPoints + " / " + selectedUnit.props.maxMagicPoints);
            infoMP.visible = true;
            infoMP.active = true;


            console.log("Opening menu.")
            this.menuOn = true;
            this.currentMenu = "main";
        }
        else
        {
            this.closeMenu();
        }
    }

    closeMenu()
    {
        // the menu is already open, so we want to close it. cull all objects placed on the screen previously by this function
        var members = this.menuGroup.getChildren();
        members.forEach(element => {
            this.menuGroup.killAndHide(element);
            element.removeAllListeners();
        });
        // TODO: refactor this to only use menuGroup
        members = this.menuIconGroup.getChildren();
        members.forEach(element => {
            this.menuIconGroup.killAndHide(element);
        });
        // remove text as well
        members = this.menuTextGroup.getChildren();
        members.forEach(element => {
            this.menuTextGroup.killAndHide(element);
        });
        this.menuOn = false;
        this.currentMenu = "";
        console.log("Hiding menu.");
    }

    openActions()
    {
        this.scene.UIClicked = true;
        const owner = this.scene //just for my convenience
        //close the main menu while this one is open
        owner.closeMenu();
        owner.input.stopPropagation();
        console.log("Action selected.");
        //create windows
        if (this.currentMenu != "action")
        {
            owner.currentMenu = "action";
            var actions = [];
            const infoBox = owner.createSprite(111 * owner.scaleFactor, 33 * owner.scaleFactor, 'ui_info');
            const infoText = owner.createText(10, infoBox.y - 30, "", {fontFamily: '"Courier New"', wordWrap: {width: 100, useAdvancedWrap: true}});
            infoText.setFontSize(18)
            const updateInfo = (infoStr) => {infoText.setText(infoStr);};
            infoBox.setScrollFactor(0);
            infoBox.setScale(2);
            infoText.setWordWrapWidth(400);
            //for now, everyone has the Strike Skill. if this ever changes, refactor this out and only ever render actions array above
            var strikeBar = owner.createSprite(infoBox.x, infoBox.y + (34 + 29 * owner.scaleFactor), 'ui_list', true);
            strikeBar.setScrollFactor(0);
            strikeBar.setScale(2);
            strikeBar.on('pointerover', () => {updateInfo(actionDict['Strike'].name + ": " + actionDict['Strike'].desc)});
            strikeBar.once('pointerdown', () => {
                owner.yield();
                eventManager.emit('action', owner.currentUnit, actionDict['Strike'].name);
            });
            var strikeText = owner.createText(10, strikeBar.y - 18, "Strike", {fontFamily: '"Courier New"', wordWrap: {width: 400, useAdvancedWrap: true}});
            strikeText.setFontSize(24);
            for (let index = 0; index < owner.currentUnit.props.skills.length; index++) {
                const element = owner.createSprite(strikeBar.x, strikeBar.y + (58 * (index + 1)), 'ui_list')
                element.setScrollFactor(0);
                element.setScale(2);
                element.on('pointerover', () => {updateInfo(actionDict[owner.currentUnit.props.skills[index]].name + ": " + actionDict[owner.currentUnit.props.skills[index]].desc)});
                element.once('pointerdown', () => {
                    owner.yield();
                    eventManager.emit('action', owner.currentUnit, actionDict[owner.currentUnit.props.skills[index]].name);
                })
                const elementText = owner.createText(10, element.y - 18, owner.currentUnit.props.skills[index]);
            }

        }
        else
        {
            this.closeActions();
        }
        console.log(owner.actionGroup.getChildren());
        
    }
    //cull all actions-related groups
    closeActions()
    {
        var members = this.actionGroup.getChildren();
        members.forEach(element => {
            this.actionGroup.killAndHide(element);
            element.removeAllListeners();
        });
        members = this.actionTextGroup.getChildren();
        members.forEach(element => {
            this.actionTextGroup.killAndHide(element);
        });
    }

    openMove()
    {
        this.scene.UIClicked = true;
        console.log("Move selected.");
        console.log(this.scene.currentUnit);
        //send event to main game to show grid for, and resolve move
        eventManager.emit('move', this.scene.currentUnit);
        this.scene.yield();
    }
    openStatus()
    {
        this.scene.UIClicked = true;
        console.log("Status selected.");
        const owner = this.scene //just for my convenience
        //close the main menu while this one is open
        owner.closeMenu();
        owner.input.stopPropagation();
        //create back window
        var statusWindow = owner.createSprite(512, 198, 'ui_statuswindow', true);
        statusWindow.setScale(3);
        var statusName = owner.createText(statusWindow.x - 300, statusWindow.y - 180, owner.currentUnit.props.name, {fontFamily: '"Courier New"', fontSize: 50});
        statusName.setText(owner.currentUnit.props.name);
        statusName.visible = true;
        statusName.active = true;
        var statusHP = owner.createText(statusWindow.x - 100, statusWindow.y - 120, "HP: " + owner.currentUnit.props.hitPoints + " / " + owner.currentUnit.props.maxHitPoints, {fontFamily: '"Courier New"', fontSize: 24});
        var statusMP = owner.createText(statusWindow.x + 100, statusWindow.y - 120, "MP: " + owner.currentUnit.props.magicPoints + " / " + owner.currentUnit.props.maxMagicPoints, {fontFamily: '"Courier New"', fontSize: 24});
        var statusAttack = owner.createText(statusWindow.x - 300, statusWindow.y - 100, "Attack: " + owner.currentUnit.props.attack, {fontFamily: '"Courier New"', fontSize: 24});
        var statusDefense = owner.createText(statusWindow.x - 300, statusWindow.y - 70, "Defense: " + owner.currentUnit.props.defense, {fontFamily: '"Courier New"', fontSize: 24});
        var statusForce = owner.createText(statusWindow.x - 300, statusWindow.y - 40, "Force: " + owner.currentUnit.props.force, {fontFamily: '"Courier New"', fontSize: 24});
        var statusSpirit = owner.createText(statusWindow.x - 300, statusWindow.y - 10, "Spirit: " + owner.currentUnit.props.spirit, {fontFamily: '"Courier New"', fontSize: 24});
        var statusHit = owner.createText(statusWindow.x, statusWindow.y - 70, "Hit: " + owner.currentUnit.props.hit, {fontFamily: '"Courier New"', fontSize: 24});
        var statusSpeed = owner.createText(statusWindow.x, statusWindow.y - 40, "Speed: " + owner.currentUnit.props.speed, {fontFamily: '"Courier New"', fontSize: 24});
        var statusLuck = owner.createText(statusWindow.x, statusWindow.y - 10, "Luck: " + owner.currentUnit.props.luck, {fontFamily: '"Courier New"', fontSize: 24});
        var statusDesc = owner.createText(statusWindow.x - 300, statusWindow.y + 50, owner.currentUnit.props.description, {fontFamily: '"Courier New"', fontSize: 20, wordWrap: {width: 600, useAdvancedWrap: true}});

        statusWindow.on('pointerdown', () => {this.scene.yield()});
    }

    //Immediately close all menus and yield back to the game scene.
    yield()
    {
        this.closeActions();
        this.closeMenu();
        eventManager.emit('menu_status', this.menuOn);  
    }

    //create buttons with the confirmation menu, and holds the logic for resolving that confirmation.
    openConfirmation(input)
    {
        //create confirm? window with options beneath
        console.log("Begin confirm process.");
        var confirmPrompt = this.createSprite(64, 48, 'ui_prompt');
        confirmPrompt.setScale(2);
        var confirmText = this.createText(30,  48, "Confirm?", {fontFamily: '"Courier New"', wordWrap: {width: 400, useAdvancedWrap: true}});
        confirmText.setFontSize(16);

        //create options

        var yesPrompt = this.createSprite(64, 144, 'ui_prompt', true);
        yesPrompt.setScale(2);

        var yesText = this.createText(30, 144, "Yes", {fontFamily: '"Courier New"', wordWrap: {width: 400, useAdvancedWrap: true}});

        var noPrompt = this.createSprite(64, 240, 'ui_prompt', true);
        noPrompt.setScale(2);
        var noText = this.createText(30, 240, "No", {fontFamily: '"Courier New"', wordWrap: {width: 400, useAdvancedWrap: true}});

        // signal perform the action and then clean up any menus.
        yesPrompt.once('pointerdown', () => {
            eventManager.emit("doAction", {unit: this.currentUnit, skillName: input.skill, tile: input.tile});
            stateManager.confirmationMode = false;
            stateManager.selectionMode = false;
            this.closeMenu();
        })
        noPrompt.once('pointerdown', () => {
            stateManager.confirmationMode = false;
            stateManager.selectionMode = false;
            this.closeMenu();
            this.yield();
        })
    }


    //Creates a sprite on the screen. Defaults to menuGroup for HUD convience, but group may be specified
    //to use a different one instead. This is the same as the function in arenamap.js, but redefined for a different preset.
    createSprite(x, y, key = '', isInteractive = false, group = this.menuGroup)
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
        return sprite;
    }

    createText(x, y, text, props = {fontFamily: '"Courier New"'})
    {
        var words = this.menuTextGroup.get(x, y, text, props);
        // Group.get() does NOT assign any properties other than position if it can acquire an existing
        // Text object. Therefore, all of these properies need to be reset just in case
        words.setText(text);
        words.setOrigin(0, 0);
        words.visible = true;
        words.active = true;
        if (props.fontSize)
        {
            words.setFontSize(props.fontSize);
        }
        return words;
    }

    selectOnMenu()
    {
        //Once the game is over, disallow further input.
        if (stateManager.gameOver)
        {
            return;
        }
        if ((this.UIClicked == false))
        {
            if (this.currentMenu == "action")
            {
                this.closeMenu();
                this.currentMenu = "main";
                this.openMenu();
            }
            else if (this.currentMenu == "main")
            {
                this.openMenu();
                this.currentMenu = "";
                if(this.menuOn == false)
                {
                    console.log("Returning control to game scene.");
                    eventManager.emit('menu_status', this.menuOn);
                }
            }
            
        }
        else
        {
            //skip for now... but make sure to check if the player is actually clicking a UI element the next time
            this.UIClicked = false;
        }
    }

}