import { ST } from "next/dist/shared/lib/utils";
import unitManager from "./unitManager";
import eventManager from "./scenes/eventManager";
const axios = require('axios').default;

async function sendScore(name:string, levelNum: number)
{
    try
    {
        const response = await axios.post('api/scoreSave', {
            "playerName" : name,
            "score" : stateManager.score.damageDealt + stateManager.score.damageTaken + stateManager.score.effectiveHits + stateManager.score.timeBonus,
            "level" : levelNum
        })
        console.log(response);
    }
    catch(error)
    {
        console.error(error);
    }
}
class StateManager
{
    public isPlayerTurn:boolean;
    public victoryState:number = 0;
    public actionCount: number = 0;
    public selectionMode: boolean = false;
    public confirmationMode: boolean = false;
    public selectMove: boolean = false;
    public inAnimation: boolean = false;
    public gameOver: boolean = false;
    public turnCount: number = 0;
    public level: number = 0;
    public score = {
        damageDealt : 0,
        damageTaken : 0,
        effectiveHits: 0,
        timeBonus: 0
    }
    constructor()
    {
        this.isPlayerTurn = false;
    }

    sendPlayerScore(name:string)
    {
        sendScore(name, this.level);
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
            stateManager.gameOver = true;
            eventManager.emit('gameEnd', this.victoryState);
            this.score.timeBonus = 50 - (this.turnCount * 5);
            if (this.score.timeBonus < 0)
            {
                this.score.timeBonus = 0;
            }
            return;
        }

        //if no units can act but action points are still left, re-set the acting status of all units.
        if(this.isPlayerTurn)
        {
            if (!unitManager.allyUnits.find(x => x.canAct == true))
            {
                unitManager.allyUnits.forEach(element => {
                    element.canAct = true;
                    element.canMove = true;
                });
            }
        }
        else
        {
            if (!unitManager.enemyUnits.find(x => x.canAct == true))
            {
                unitManager.enemyUnits.forEach(element => {
                    element.canAct = true;
                    element.canMove = true;
                });
            }
        }
        var currentTeam
        // if no actions are remaining, or if all units have chosen to pass, switch turns
        if (this.actionCount < 1 || (this.isPlayerTurn && !unitManager.allyUnits.find(x => x.hasPassed == false)) || (!this.isPlayerTurn && !unitManager.enemyUnits.find(x => x.hasPassed == false)))
        {
            if (this.isPlayerTurn)
            {
                this.turnCount += 1;
                this.isPlayerTurn = false;
                console.log("Enemy turn");
                eventManager.emit('showturnprompt');
                //refresh everyone's action/movement status
                unitManager.enemyUnits.forEach(element => {
                    element.canAct = true;
                    element.canMove = true;
                    element.hasPassed = false;
                });

                this.actionCount = 0;
                console.log(this.actionCount);
                //for every non-defeated enemy, we gain an action point at the start of our turn.
                unitManager.enemyUnits.forEach((element) => {
                    if (element.props.hitPoints > 0)
                    {
                        this.actionCount += 1;
                    }
                })
                eventManager.emit('ai_turn');
            }
            else
            {
                this.isPlayerTurn = true;
                eventManager.emit('showturnprompt');
                //refresh everyone's action/movement status
                unitManager.allyUnits.forEach(element => {
                    element.canAct = true;
                    element.canMove = true;
                    element.hasPassed = false;
                });

                this.actionCount = 0;
                //for every non-defeated ally, we gain an action point at the start of our turn.
                unitManager.allyUnits.forEach((element) => {
                    if (element.props.hitPoints > 0)
                    {
                        this.actionCount += 1;
                    }
                })
                console.log("Player's turn!");
            }
        }
        else
        {
            if (!this.isPlayerTurn)
            {
                //continue this process again until the AI has used up all of its turns.
                eventManager.emit('ai_turn');
            }
        }

        
    }
}

const stateManager = new StateManager;

export default stateManager;