import { ST } from "next/dist/shared/lib/utils";
import unitManager from "./unitManager";
import eventManager from "./scenes/eventManager";

class StateManager
{
    public isPlayerTurn:boolean;
    public victoryState:number = 0;
    public actionCount: number = 0;
    public selectionMode: boolean = false;
    public confirmationMode: boolean = false;
    public selectMove: boolean = false;
    public inAnimation: boolean = false;
    constructor()
    {
        this.isPlayerTurn = false;
    }

    checkState()
    {
        //check for victory state
        var allEnemiesDefeated = true;
        unitManager.enemyUnits.forEach(element => {
            if (element.props.hitPoints > 0)
            {
                allEnemiesDefeated = false;
            }
        });
        if (allEnemiesDefeated)
        {
            //the player wins!
            this.victoryState = 1;
        }
        var allAlliesDefeated = true;
        unitManager.allyUnits.forEach(element => {
            if (element.props.hitPoints > 0)
            {
                allAlliesDefeated = false;
            }
        });
        if (allAlliesDefeated)
        {
            //the player has lost.
            this.victoryState = -1;
        }

        //if a victory state is reached, end
        if (this.victoryState != 0)
        {
            //do ending things
            return;
        }
        // if no actions are remaining, switch turns
        if (this.actionCount < 1)
        {
            if (this.isPlayerTurn)
            {
                this.isPlayerTurn = false;
                console.log("Enemy turn");
                eventManager.emit('ai_turn');
            }
            else
            {
                this.isPlayerTurn = true;
                console.log("Player's turn!");
            }
        }

        
    }
}

const stateManager = new StateManager;

export default stateManager;