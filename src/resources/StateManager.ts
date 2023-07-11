import UnitManager from "./unitManager";

export default class StateManager
{
    public isPlayerTurn:boolean;
    public victoryState:number = 0;
    public actionCount: number = 0;
    constructor()
    {
        this.isPlayerTurn = false;
    }

    checkState(manager : UnitManager)
    {
        //check for victory state
        var allEnemiesDefeated = true;
        manager.enemyUnits.forEach(element => {
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
        manager.allyUnits.forEach(element => {
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
            }
            else
            {
                this.isPlayerTurn = true;
                console.log("Player's turn!");
            }
        }

        
    }
}