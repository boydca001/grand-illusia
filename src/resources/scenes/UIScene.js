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

        eventManager.on('open-menu', this.takeFocus, this);
        this.menuOn = false;
        this.currentMenu = "";
        this.UIClicked = false;

        this.input.on('pointerdown', this.selectOnMenu, this);
        eventManager.on('confirm', this.openConfirmation, this);
        this.currentUnit = null;

        this.scaleFactor = 2; //generally what i think a good scale for the UI is
    }

    update()
    {

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
                for (let index = 0; index < 3; index++) {
                    const element = this.menuGroup.get(32 * this.scaleFactor, ((index * 48) + 24) * this.scaleFactor, 'ui_prompt');
                    element.setTexture('ui_prompt');
                    element.setScrollFactor(0);
                    element.setScale(2);
                    element.active = true;
                    element.visible = true;
                    element.setInteractive();
                    if (index == 0)
                    {
                        element.once('pointerdown', this.openActions,);
                        var icon = this.menuIconGroup.get(element.x, element.y, 'ui_action');
                        icon.setTexture('ui_action');
                        icon.setScrollFactor(0);
                        icon.setScale(1.75);
                        icon.active = true;
                        icon.visible = true;
                    }
                    if (index == 1)
                    {
                        element.once('pointerdown', this.openMove);
                        var icon = this.menuIconGroup.get(element.x, element.y, 'ui_move');
                        icon.setTexture('ui_move');
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

                }
            }
            else
            {
                //this is an enemy/other unit. only display their stats
                const element = this.menuGroup.get(32 * this.scaleFactor, ((3 * 48) + 24) * this.scaleFactor, 'ui_prompt');
                element.setTexture('ui_prompt');
                element.setScrollFactor(0);
                element.setScale(2);
                element.active = true;
                element.visible = true;
                element.setInteractive();
                element.once('pointerdown', this.openStatus);
                var icon = this.menuIconGroup.get(element.x, element.y, 'ui_status');
                icon.setTexture('ui_status');
                icon.setScrollFactor(0);
                icon.setScale(1.75);
                icon.active = true;
                icon.visible = true;
            }

            //make the info bar at the bottom. everyone sees this no matter what
            var infoBar = this.menuGroup.get(512, 702, 'ui_info');
            infoBar.setTexture('ui_info');
            infoBar.visible = true;
            infoBar.active = true;
            infoBar.setScale(2);
            var infoName = this.menuTextGroup.get(infoBar.x - 200, infoBar.y - 50, selectedUnit.props.name, {fontFamily: '"Courier New"', fontSize: 30});
            infoName.setText(selectedUnit.props.name);
            infoName.visible = true;
            infoName.active = true;
            var infoHP = this.menuTextGroup.get(infoBar.x - 90, infoBar.y - 50, selectedUnit.props.hitPoints, {fontFamily: '"Courier New"', fontSize: 20});
            infoHP.setText("HP: " + selectedUnit.props.hitPoints + " / " + selectedUnit.props.maxHitPoints);
            infoHP.visible = true;
            infoHP.active = true;
            var infoMP = this.menuTextGroup.get(infoBar.x + 50, infoBar.y - 50, selectedUnit.props.magicPoints, {fontFamily: '"Courier New"', fontSize: 20});
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
            const infoBox = owner.actionGroup.get(111 * owner.scaleFactor, 33 * owner.scaleFactor, 'ui_info');
            const infoText = owner.actionTextGroup.get(10, infoBox.y - 18, "", {fontFamily: '"Courier New"', wordWrap: {width: 400, useAdvancedWrap: true}});
            const updateInfo = (infoStr) => {infoText.setText(infoStr);};
            infoBox.setScrollFactor(0);
            infoBox.setScale(2);
            infoBox.visible = true;
            infoText.visible = true;
            infoBox.active = true;
            infoText.active = true;
            //for now, everyone has the Strike Skill. if this ever changes, refactor this out and only ever render actions array above
            var strikeBar = owner.actionGroup.get(infoBox.x, infoBox.y + (34 + 29 * owner.scaleFactor), 'ui_list');
            strikeBar.setScrollFactor(0);
            strikeBar.setScale(2);
            strikeBar.setInteractive();
            strikeBar.on('pointerover', () => {updateInfo(actionDict['Strike'].name + ": " + actionDict['Strike'].desc)});
            strikeBar.once('pointerdown', () => {
                this.scene.yield();
                eventManager.emit('action', this.scene.currentUnit, actionDict['Strike'].name);
            });
            var strikeText = owner.actionTextGroup.get(10, strikeBar.y - 18, "Strike", {fontFamily: '"Courier New"', wordWrap: {width: 400, useAdvancedWrap: true}});
            strikeBar.visible = true;
            strikeBar.active = true;
            strikeText.visible = true;
            strikeText.active = true;

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
        var statusWindow = owner.menuGroup.get(512, 198, 'ui_statuswindow');
        statusWindow.setTexture('ui_statuswindow');
        statusWindow.setScale(3);
        statusWindow.visible = true;
        statusWindow.active = true;
        statusWindow.setInteractive();
        var statusName = owner.menuTextGroup.get(statusWindow.x - 300, statusWindow.y - 180, "", {fontFamily: '"Courier New"', fontSize: 50});
        statusName.setText(owner.currentUnit.props.name);
        statusName.visible = true;
        statusName.active = true;
        var statusHP = owner.menuTextGroup.get(statusWindow.x - 100, statusWindow.y - 180, "", {fontFamily: '"Courier New"', fontSize: 24});
        statusHP.setText("HP: " + owner.currentUnit.props.hitPoints + " / " + owner.currentUnit.props.maxHitPoints);
        statusHP.visible = true;
        statusHP.active = true;
        var statusMP = owner.menuTextGroup.get(statusWindow.x + 100, statusWindow.y - 180, "", {fontFamily: '"Courier New"', fontSize: 24});
        statusMP.setText("MP: " + owner.currentUnit.props.magicPoints + " / " + owner.currentUnit.props.maxMagicPoints);
        statusMP.visible = true;
        statusMP.active = true;
        var statusAttack = owner.menuTextGroup.get(statusWindow.x - 300, statusWindow.y - 100, "", {fontFamily: '"Courier New"', fontSize: 24});
        statusAttack.setText("Attack: " + owner.currentUnit.props.attack);
        statusAttack.visible = true;
        statusAttack.active = true;
        var statusDefense = owner.menuTextGroup.get(statusWindow.x - 300, statusWindow.y - 70, "", {fontFamily: '"Courier New"', fontSize: 24});
        statusDefense.setText("Defense: " + owner.currentUnit.props.defense);
        statusDefense.visible = true;
        statusDefense.active = true;
        var statusForce = owner.menuTextGroup.get(statusWindow.x - 300, statusWindow.y - 40, "", {fontFamily: '"Courier New"', fontSize: 24});
        statusForce.setText("Force: " + owner.currentUnit.props.force);
        statusForce.visible = true;
        statusForce.active = true;
        var statusSpirit = owner.menuTextGroup.get(statusWindow.x - 300, statusWindow.y - 10, "", {fontFamily: '"Courier New"', fontSize: 24});
        statusSpirit.setText("Spirit: " + owner.currentUnit.props.spirit);
        statusSpirit.visible = true;
        statusSpirit.active = true;
        var statusHit = owner.menuTextGroup.get(statusWindow.x, statusWindow.y - 100, "", {fontFamily: '"Courier New"', fontSize: 24});
        statusHit.setText("Hit: " + owner.currentUnit.props.hit);
        statusHit.visible = true;
        statusHit.active = true;
        var statusSpeed = owner.menuTextGroup.get(statusWindow.x, statusWindow.y - 70, "", {fontFamily: '"Courier New"', fontSize: 24});
        statusSpeed.setText("Speed: " + owner.currentUnit.props.speed);
        statusSpeed.visible = true;
        statusSpeed.active = true;
        var statusLuck = owner.menuTextGroup.get(statusWindow.x, statusWindow.y - 40, "", {fontFamily: '"Courier New"', fontSize: 24});
        statusLuck.setText("Luck: " + owner.currentUnit.props.luck);
        statusLuck.visible = true;
        statusLuck.active = true;

        var statusDesc = owner.menuTextGroup.get(statusWindow.x - 300, statusWindow.y + 50, "", {fontFamily: '"Courier New"', fontSize: 20, wordWrap: {width: 600, useAdvancedWrap: true}});
        statusDesc.setText(owner.currentUnit.props.description);
        statusDesc.visible = true;
        statusDesc.active = true;

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
        var confirmPrompt = this.menuGroup.get(64, 48, 'ui_prompt');
        confirmPrompt.visible = true;
        confirmPrompt.active = true;
        confirmPrompt.setScale(2);
        var confirmText = this.menuTextGroup.get(30,  48, "Confirm?", {fontFamily: '"Courier New"', wordWrap: {width: 400, useAdvancedWrap: true}});
        confirmText.setText("Confirm?");
        confirmText.setFontSize(16);
        confirmText.visible = true;
        confirmText.active = true;

        //create options

        var yesPrompt = this.menuGroup.get(64, 144, 'ui_prompt');
        yesPrompt.visible = true;
        yesPrompt.active = true;
        yesPrompt.setScale(2);
        yesPrompt.setInteractive();
        var yesText = this.menuTextGroup.get(30, 144, "Yes", {fontFamily: '"Courier New"', wordWrap: {width: 400, useAdvancedWrap: true}});
        yesText.setText("Yes");
        yesText.visible = true;
        yesText.active = true;

        var noPrompt = this.menuGroup.get(64, 240, 'ui_prompt');
        noPrompt.visible = true;
        noPrompt.active = true;
        noPrompt.setScale(2);
        noPrompt.setInteractive();
        var noText = this.menuTextGroup.get(30, 240, "No", {fontFamily: '"Courier New"', wordWrap: {width: 400, useAdvancedWrap: true}});
        noText.setText("No");
        noText.visible = true;
        noText.active = true;

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


    selectOnMenu()
    {
        console.log("General click detected.");
        console.log("UIClicked: " + this.UIClicked);
        console.log("menuOn: " + this.menuOn);
        if ((this.UIClicked == false))
        {
            if (this.currentMenu == "action")
            {
                this.closeActions();
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