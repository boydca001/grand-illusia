// Definition for the baseline for a unit. The definition of every unit in the game follows this pattern.


export default class Unit 
{
    name;
    hitPoints;
    maxHitPoints;
    hitPointGrowth;

    magicPoints;
    maxMagicPoints;
    magicPointGrowth;

    baseAP;

    attack;
    defense;
    force;
    spirit;
    hit;
    speed;
    luck;
    description;

    constructor(
        name,
        hitPoints, 
        maxHitPoints, 
        magicPoints, 
        maxMagicPoints,
        baseAP,
        hitPointGrowth,
        magicPointGrowth,
        attack,
        defense,
        force,
        spirit,
        hit,
        speed,
        luck,
        description = "Hmm...? This unit has no description!")
    {
        this.name = name;
        this.hitPoints = hitPoints;
        this.maxHitPoints = maxHitPoints;
        this.magicPoints = magicPoints;
        this.maxMagicPoints = maxMagicPoints;
        this.baseAP = baseAP;

        this.hitPointGrowth = hitPointGrowth;
        this.magicPointGrowth = magicPointGrowth;

        this.attack = attack;
        this.defense = defense;
        this.force = force;
        this.spirit = spirit;
        this.hit = hit;
        this.speed = speed;
        this.luck = luck;
        this.description = description;
    }
    //Generic handler for taking damage, but really just manipulates HP. key: 0 = healing | 1 = physdamage | 2 = magicdamage
    takeDamage(damageType, damageAmount, damageElem = 0) 
    {
        totalDamage = damageAmount;
        //manipulate the above if elemental weaknesses ever becomes a thing

        if (damageType == 1)
        {
            this.hitPoints -= (damageAmount - defense);
        }
        if (damageType == 2)
        {
            this.hitPoints -= (damageAmount - spirit);
        }
        if (damageType == 0)
        {
            this.hitPoints += damageAmount;
        }
    };

    //MP manipulation. Fairly straightforward, can be used to increase or decrease mana.
    modifyMP(amount)
    {
        this.magicPoints += amount;
    }
    
}