
const TARGETS_ENEMY = 0;
const TARGETS_ALLY = 1;
const TARGETS_SELF = 2;

//Targeting constants

// One target.
const ONE = 0;
// A cross of 5 tiles, centered on the target.
const CROSS = 1;
// All units in range. On supportive effects, generally only targets allies.
const ALL = 2;

//the default class for handling actions you can perform in combat.
export default class BaseAction
{
    //The name of the action.
    name = "NULL";
    desc = "This action has no description.";
    cost = 0;
    range = 0;


    activate;

    //who the action is INTENDED to be used on. The actual possible targets may vary or be a combination of the options
    targets = 0;


    constructor({name, desc, cost, range, activate, targets, animate})
    {
        this.name = name;
        this.desc = desc;
        this.cost = cost;
        this.range = range;
        this.activate = activate;
        this.targets = targets;

    }

    
    

}