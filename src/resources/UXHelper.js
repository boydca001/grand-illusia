

export default class UXHelper
{
    name = "";
    desc = "";
    curHP = "";
    curMP = "";
    constructor()
    {
        if (UXHelper._instance)
        {
            return UXHelper._instance;
        }
        console.log("Made a helper.");
        UXHelper._instance = this;
    }
}

const helper = new UXHelper();