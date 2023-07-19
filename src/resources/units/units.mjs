import Unit from './baseUnit.mjs'

let UnitDict =
{
    "Maya" : new Unit(
        "Maya",
        30,
        30,
        100,
        100,
        1,
        1,
        1,
        3,
        3,
        3,
        3,
        3,
        3,
        3,
        "A kindhearted, hardworking, and determined girl who is always looking to help those around her whenever she can. She is a "
        + "well-rounded character with no significant strengths or flaws."
    ),

    "Ivene" : new Unit(
        "Ivene",
        30,
        30,
        100,
        100,
        1,
        3,
        3,
        2,
        1,
        7,
        5,
        3,
        3,
        3,
        "An intelligent boy from the college in Maya's town. Although his physical stats are low, he has very high Force and Spirit."
        + "His magic attacks are quite potent.",
        ['Water Sphere']
    ),

    "Slime" : new Unit (
        "Slime",
        25,
        25,
        100,
        100,
        1,
        1,
        1,
        3,
        1,
        1,
        1,
        1,
        1,
        1,
        "An interesting, playful gelatinous monster that roams certain places. It is not very strong, but it is trying it's best...",
        ["Bounce"]
    )
}

export default UnitDict;

//test
var testvar = {...UnitDict["Maya"]};
console.log({...UnitDict["Maya"]});
console.log({...testvar});
console.log("This is " + testvar.name + ". " + testvar.description);
