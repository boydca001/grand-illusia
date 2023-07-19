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
    skills;

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
        description = "Hmm...? This unit has no description!",
        skills = [])
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
        this.skills = skills;
    }
    //Generic handler for taking damage, but really just manipulates HP. key: 0 = healing | 1 = physdamage | 2 = magicdamage
    //Currently element is unused, as multiple types of spell do not exist yet!
    takeDamage(damageType, damageAmount, damageElem = 0)
    {
        var totalDamage = 0;
        //manipulate the above if elemental weaknesses ever becomes a thing

        if (damageType == 1)
        {
            totalDamage -= (damageAmount - this.defense);
        }
        if (damageType == 2)
        {
            totalDamage -= (damageAmount - this.spirit);
        }
        if (damageType == 0)
        {
            totalDamage += damageAmount;
        }
        this.hitPoints += totalDamage;
        if (this.hitPoints < 0)
        {
            this.hitPoints = 0;
        }
        return totalDamage;
    };

    //MP manipulation. Fairly straightforward, can be used to increase or decrease mana.
    modifyMP(amount)
    {
        this.magicPoints += amount;
    }
    
}