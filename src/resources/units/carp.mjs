import Fish from './fish.mjs'

export default class Carp extends Fish { 
    constructor()
    {
        super();
        this.fishPower += 5;
    }
}