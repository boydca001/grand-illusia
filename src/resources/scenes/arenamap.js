import { Scene, Tilemaps } from "phaser"

export default class Arenamap extends Scene
{
    constructor()
    {
        super('arenamap')
    }
    preload()
    {
        //this.load.image('grasstile', 'TILE.png');
        //this.load.tilemapTiledJSON('themap', 'basicMap.json');
        this.load.image('grasstile', 'assets/TILE.png');

    };

    create()
    {
        //const tile = this.add.image(100, 100, 'grasstile');

        //this doesn't work and just constructs an generic empty map
        this.map = this.make.tilemap({key: 'basicMap'});
        //shown from this
        console.log(this.map);
        const tileset = this.map.addTilesetImage('JustGrass', 'grasstile');
        console.log(tileset);
        //...however, this DOES show the correct information.
        console.log(this.cache.tilemap.get('basicMap'));

        const layer = this.map.createLayer('toplayer', tileset, 0, 0);
        //this.cameras.main.setBounds(0,0, map.widthInPixels, map.heightInPixels, true);
        //this.cameras.main.scrollX -= map.widthInPixels/2;

        //center map??
        this.camXOffset = ((this.cameras.main.displayWidth)/2);
        this.camYOffset = (this.cameras.main.displayHeight)/2;
        const centerTile = layer.getTileAt(5,6);

        //this.cameras.main.setScroll(centerTile.x - this.camXOffset,centerTile.y - this.camYOffset);

        this.cameras.main.setScroll(centerTile.getCenterX() - this.camXOffset,centerTile.getCenterY() - this.camYOffset);

        this.cameras.main.setZoom(1.5,1.5);


        //experiment for placing the grid EXACTLY on screen
        /*const corner = layer.getTopLeft();
        console.count(corner.x + ", " + corner.y);
        console.count(layer.originX + ", " + layer.originY);
        this.cameras.main.setScroll(layer.x, layer.y);*/

        //create our controls
        this.cursors = this.input.keyboard.createCursorKeys(); 

        //and then the player to use them
        this.indic = this.makeCursor();
        this.indic.setPosition(centerTile.getCenterX(),centerTile.getCenterY());

        //listener for clicking around
        this.input.on('pointerdown', this.goToClickedTile, this);
    }

    update()
    {
        
    }

    goToClickedTile()
    {
        //console.log(this.map);
        var targetTile = this.map.getTileAtWorldXY(this.input.activePointer.worldX, this.input.activePointer.worldY + 32);

        if (targetTile == null)
        {
            //console.log("No tile found, but the cursor is at " + this.input.activePointer.worldX +", " + this.input.activePointer.worldY);
        }
        else
        {
            console.log("Going to tile (" + targetTile.x + ", " + targetTile.y + ") at " + targetTile.pixelX + ", " + targetTile.pixelY + "(cursor at " +  this.input.activePointer.worldX +", " + this.input.activePointer.worldY+ ")");
            //this.cameras.main.setScroll(targetTile.getCenterX() - this.camXOffset, targetTile.getCenterY() - this.camYOffset);
            this.tweens.add(
                {
                    targets: this.cameras.main,
                    scrollX: targetTile.getCenterX() - this.camXOffset,
                    scrollY: targetTile.getCenterY() - this.camYOffset,
                    duration: 500,
                    ease : 'quad'
                }
            )
            this.tweens.add(
                {
                    targets: this.indic,
                    x: targetTile.getCenterX(),
                    y: targetTile.getCenterY(),
                    duration: 180,
                    ease: 'quad'
                }
            )
        }
    }

    makeCursor()
    {
        const cursor = this.add.image(0,0, 'pointer');
        return cursor;
    }
}