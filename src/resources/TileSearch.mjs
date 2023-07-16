import { Scene } from "phaser"
import unitManager from "./unitManager";

//a little helper for calculating the distance/paths for tiles and and whether or not they're reachable.
//this function expects a starting tile, and an ending tile, and takes into account which side a unit using
// it is on and to ignore tiles occupied by opposing units.
export function tileSearch(startTile, endTile)
{
    var openList = [];
    var closedList = [];


    //find out what group the unit requesting this search is in (as they will generally always be on startTile)
    var thisUnit = unitManager.findAt(startTile.x, startTile.y)
    var isAlly = unitManager.allyUnits.includes(thisUnit);
    //create our starting point.
    //our format should be {tile, g, h, f}
    openList.push({tile : startTile, g : 0, h : distanceFrom(startTile, endTile), f : distanceFrom(startTile, endTile), p : null});
    

    while (openList.length > 0) 
    {
        //find tile with lowest f. start by assuming the first entry has it, and then updating
        var lowestF = openList[0];
        openList.forEach(element => {
            if (element.f < lowestF.f)
            {
                lowestF = element;
            }
        });

        //end case: the tile of lowestF = endTile
        if (lowestF.tile == endTile)
        {
            var output = [];
            var curTile = lowestF;
            while (curTile.p) {
                output.push(curTile.tile);
                curTile = curTile.p;
            }
            console.log("We have arrivedd at our destination.");
            return output.reverse();
        }
        console.log(lowestF);
        console.log("Searching around " + lowestF.tile.x + ", " + lowestF.tile.y);

        //normal case - remove it from the open list..
        openList.splice(openList.indexOf(lowestF), 1);

        //and place the TILE on the closed list. this is important for checking if we've been here already
        closedList.push(lowestF);

        var neighbors = getNeighbors(lowestF.tile);

        neighbors.forEach(element => {
            //check if this tile contains a unit of the opposing side
            var obstructed = false;
            console.log(element);
            if (element !=null)
            {
                var neighborUnit = unitManager.findAt(element.x, element.y);
                if (neighborUnit)
                {
                    //this tile is occupied. check if it is occupied by an ally or enemy
                    if(isAlly)
                    {
                        if (!unitManager.allyUnits.includes(neighborUnit))
                        {
                            obstructed = true;
                        }
                    }
                    else
                    {
                        if (!unitManager.enemyUnits.includes(neighborUnit))
                        {
                            obstructed = true;
                        }
                    }
                }
            }
            // here we place conditions for valid and invalid nodes. a "tile" that is equal to null or unmapped tiles are invalid tiles,
            // and elements in closedList shouldn't be checked twice.
            if (element == null || closedList.find(x => x.tile === element) || obstructed)
            {
                //do nothing
            }
            else
            {
                var toAdd = {tile : element, g : undefined, h : undefined, f : undefined, p : null};
                //calculate the g cost, which will be 1 more than its previous.
                var gScore = lowestF.g + 1;
                var gIsBest = false;
                var openSearch = openList.find(x => x.tile === element);
                console.log(openSearch);
                if(!openSearch)
                {
                    //if this element DOESN'T exist in the open list, add it to the openlist.
                    openList.push(toAdd);
                    toAdd.h = distanceFrom(toAdd.tile, endTile);
                    console.log("Adding to list.");
                    gIsBest = true;
                }
                else
                {
                    //let this then be a reference to the version already in the openlist.
                    toAdd = openSearch; 
                    if (gScore < toAdd.g)
                    {
                        //we've found a better path to this tile.
                        gIsBest = true;
                    }
                }

                if (gIsBest)
                {
                    //update our info on the optimal path to this tile.
                    toAdd.p = lowestF;
                    toAdd.g = gScore;
                    toAdd.f = toAdd.h + toAdd.g;
                }

            }
        });
    }
    //if we get this far in the function, i have either fucked up, or there is genuinely NO path from startTile to endTile.
    //return an empty array.
    console.log("Could not reach the destination tile.");
    return [];
}

//identical to the regular A* search algorithm above, however it only cares about the value of g(x) at the very end of the search.
export function moveDistance(startTile, endTile)
{
    var openList = [];
    var closedList = [];

    /*   //maybe remove the starting node from the list. probably isn't necessary? 
    if (tileList.includes(startTile))
    {
        var index = tileList.indexOf(startTile);
        tileList.splice()
    }*/

    //create our starting point.
    //our format should be {tile, g, h, f}
    openList.push({tile : startTile, g : 0, h : distanceFrom(startTile, endTile), f : distanceFrom(startTile, endTile), p : null});
    

    while (openList.length > 0) 
    {
        //find tile with lowest f. start by assuming the first entry has it, and then updating
        var lowestF = openList[0];
        openList.forEach(element => {
            if (element.f < lowestF.f)
            {
                lowestF = element;
            }
        });

        //end case: the tile of lowestF = endTile
        if (lowestF.tile == endTile)
        {
            return lowestF.g;
        }
        console.log(lowestF);
        console.log("Searching around " + lowestF.tile.x + ", " + lowestF.tile.y);

        //normal case - remove it from the open list..
        openList.splice(openList.indexOf(lowestF), 1);

        //and place the TILE on the closed list. this is important for checking if we've been here already
        closedList.push(lowestF);

        var neighbors = getNeighbors(lowestF.tile);

        neighbors.forEach(element => {
            // here we place conditions for valid and invalid nodes. a "tile" that is equal to null or unmapped tiles are invalid tiles,
            // and elements in closedList shouldn't be checked twice.
            if (element == null || closedList.find(x => x.tile === element))
            {
                //do nothing
            }
            else
            {
                var toAdd = {tile : element, g : undefined, h : undefined, f : undefined, p : null};
                //calculate the g cost, which will be 1 more than its previous.
                var gScore = lowestF.g + 1;
                var gIsBest = false;
                var openSearch = openList.find(x => x.tile === element);
                console.log(openSearch);
                if(!openSearch)
                {
                    //if this element DOESN'T exist in the open list, add it to the openlist.
                    openList.push(toAdd);
                    toAdd.h = distanceFrom(toAdd.tile, endTile);
                    console.log("Adding to list.");
                    gIsBest = true;
                }
                else
                {
                    //let this then be a reference to the version already in the openlist.
                    toAdd = openSearch; 
                    if (gScore < toAdd.g)
                    {
                        //we've found a better path to this tile.
                        gIsBest = true;
                    }
                }

                if (gIsBest)
                {
                    //update our info on the optimal path to this tile.
                    toAdd.p = lowestF;
                    toAdd.g = gScore;
                    toAdd.f = toAdd.h + toAdd.g;
                }

            }
        });
    }
    //if we get this far in the function, i have either fucked up, or there is genuinely NO path from startTile to endTile.
    //return an empty array.
    console.log("I MAY have fucked up.");
    return [];
}


//returns manhattan distance of each tile from eachother.
function distanceFrom(startTile, endTile)
{
    return (Math.abs(endTile.x - startTile.x) + Math.abs(endTile.y + startTile.y));
}

//get all adjacent tiles to the input tile. Tiles are aquired in the order of right, up, left, down, and tiles that don't exist will return null.
function getNeighbors(tile)
{
    let output = [];
    //console.log(tile);
    var map = tile.tilemap;
    
    output.push(map.getTileAt(tile.x+1, tile.y));
    output.push(map.getTileAt(tile.x, tile.y-1));
    output.push(map.getTileAt(tile.x-1, tile.y));
    output.push(map.getTileAt(tile.x, tile.y+1));
    //console.log(output);
    return output;
}

//return an array of values that contain every tile within ranges radius of the coordinate pair given.
export function getTilesInRadius(startTile, ranges, layer)
{
    console.log(layer);
    var xstart = startTile.x;
    var ystart = startTile.y;
    var xcounter = (ranges*2) - 1;
    console.log(xcounter);
    var yspread = (ranges - 1);
    var output = [];
    for (let index = 0; index < xcounter; index++) {
        for (let index2 = (Math.abs(yspread) - ranges) + 1; index2 < (ranges - Math.abs(yspread)); index2++) {
            var curTile = layer.getTileAt((xstart + (ranges - 1) - index), (ystart + index2));
            console.log("Value offsets: " + index + ", " + yspread);
            if (curTile == null)
            {
                console.log("No tile at " + (xstart + (ranges - 1) - index) + ", " + (ystart + index2) + ".")
            }
            else
            {
                //this.add.sprite(curTile.getCenterX(), curTile.getCenterY(), 'pointer');
                output.push(curTile);
            }
        }
        yspread -= 1;
    }
    return output;
}