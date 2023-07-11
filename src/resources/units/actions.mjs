import BaseAction from "./baseAction.mjs";
import Unit from "./baseUnit.mjs"


let ActionDict = {
    "Strike" : new BaseAction (
        "Strike",
        "A basic attack. It deals damage to an adjacent unit.",
        0,
        1,
        (x, y, Unit, manager) => {
            
        }

    )
}