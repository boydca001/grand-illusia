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
        "An interesting, playful gelatinous monster that roams certain places. It is not very strong, but it is trying it's best..."
    )
}

export default UnitDict;

//test
var testvar = {...UnitDict["Maya"]};
console.log({...UnitDict["Maya"]});
console.log({...testvar});
console.log("This is " + testvar.name + ". " + testvar.description);
