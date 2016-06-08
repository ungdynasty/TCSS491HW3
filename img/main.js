/**
 * Created by UngDynasty on 5/31/16.
 */
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    // if (index == 0) {
    //     this.reverse = true;
    // } else if (index == this.frames - 1) {
    //     this.reverse = false;
    // }
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y - this.frameHeight * scaleBy;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
        index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        locX, locY,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
}

function Bullet(game, GasMan) {
    this.type = "b";
    this.game = game;
    this.orig = GasMan;
    this.bounce = false;
    Entity.call(this, this.game, this.x, this.y);
    this.setBox(-15, -15, 15, 15);
    this.x = this.orig.x + 100;
    this.y = this.orig.y - 50;
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/fireball.gif"), 0, 0, 15, 15, 0.2, 4, true, true);
}

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;
Bullet.prototype.collision = function(other) {
    return Math.abs(this.x - other.x) < 50;
}
Bullet.prototype.update = function() {
    //this.x += 5;
    if (this.x > 800) {
        if(this.animation.isDone()) {
            this.animation.elapsedTime = 0;
        }

    }

    if (this.bounce) {
        this.x -= 5;
    } else {
        this.x  +=5;
    }

    // if (Entity instanceof ShieldGuy)
    //     this.x -= 5;
    //     console.log("ShieldGuy got hit");
    // Entity.call(this, this.game, this.x, this.y);
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this !== ent && ent.type !== 'b' && this.collision(ent)) {
            this.bounce = true;
            //this.removeFromWorld = true;
            //this.health--;
            console.log("He got hit " + this.health);
        }
    }
}

Bullet.prototype.draw = function(ctx) {

        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);


    Entity.prototype.draw.call(this);
}

function GasMan(game) {
    this.shootingCount = 0;
    //this.charging = true;
    this.health = 5;
    //this.jumping = false;
    //this.movingUp = false;
    this.bounceUp = true;
    this.bounceRight = true;
    this.radius = 100;
    this.dying = false;
    this.deathSoundStarted = false;
    this.type = 'g';
    this.x = 10;
    this.y = 600;

    this.climbAnimation = new Animation(ASSET_MANAGER.getAsset("./img/gasmask_climb.gif"), 0, 0, 25, 45, 0.1, 6, true, false);
    this.walkForwardAnimation = new Animation(ASSET_MANAGER.getAsset("./img/MegaSheet.gif"), 554, 978, 23, 38, 0.1, 8, true, false);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/MegaSheet.gif"), 310, 872, 26, 32, 0.25, 4, true, false);
    this.rollRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/gasmask_walk_right.gif"), 0, 0, 25, 41, 0.1, 10, true, false);
    this.rollLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/gasmask_walk_left.gif"), 0, 0, 25, 41, 0.1, 10, true, true);
    this.stillAnimationRight = new Animation(ASSET_MANAGER.getAsset("./img/gasmask_still_right.gif"), 0, 0, 30, 41, 0.1, 10, true, false);
    //this.punchAnimation = new Animation(ASSET_MANAGER.getAsset("./img/MegaSheet.gif"), 549, 1136, 43, 42, 0.1, 7, true, false);
    this.shootAnimation = new Animation(ASSET_MANAGER.getAsset("./img/gasmask_shoot.gif"), 0, 0, 70, 48, .07, 11, true, false);
    this.explosionAnimation = new Animation(ASSET_MANAGER.getAsset("./img/gasmask_dead.gif"), 0, 0, 50, 50, .1, 9, false, false);
    this.charging = new Animation(ASSET_MANAGER.getAsset("./img/gasmask_dead.gif"), 0, 0, 50, 50, .1, 9, false, false);
    this.punchAnimation = new Animation(ASSET_MANAGER.getAsset("./img/MegaPunch.gif"), 0, 0, 50, 42, 0.1, 6, true, false);

    Entity.call(this, game, this.x, this.y);
}

GasMan.prototype = new Entity();
GasMan.prototype.constructor = GasMan;

GasMan.prototype.update = function() {
    if (this.health < 1) {
        this.dying = true;
        console.log("GasMan has fallen...");
        if (!this.deathSoundStarted) {
            this.deathSoundStarted = true;
            //this.deathSound.play();
        }
    }

    // if (this.dying && this.explosionAnimation.elapsedTime > this.explosionAnimation.totalTime) {
    // if (this.health === 0) {
    //     //this.removeFromWorld = true;
    //     this.dying = true;
    // }

    if (this.game.shooting && this.shootingCount % 50 === 0) {
        var shovel = new Bullet(this.game, this);
        this.game.addEntity(shovel);
        //this.shovelCount++;
        this.x -= 1;
        this.shootingCount++;
    } else if (this.game.shooting) {
        this.shootingCount++;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this !== ent && this.collision(ent)) {

                ent.removeFromWorld = true;

            this.health -= 1;
            console.log("GasMan has been hit! His health is at " + this.health);
        }
    }

    if (this.game.left) {
        this.x -= 5;
        if (this.x < -48) {
            this.x = 848;
        }
    }
    if (this.game.right) {
        this.x += 5;
        if (this.x > 848) {
            this.x = -48;
        }
    }
    // if (this.game.up) {
    //     this.y -= 5;
    //     if (this.y < -54) {
    //         this.y = 854;
    //     }
    // }

    if (this.game.bounce) {
        if (this.y > 746) {
            this.bounceUp = true;
        }
        if (this.y < 0) {
            this.bounceUp = false;
        }
        if (this.x < 0) {
            this.bounceRight = true;
        }
        if (this.x > 770) {
            this.bounceRight = false;
        }
        if (this.bounceUp) {
            this.y -= 5;
        } else {
            this.y += 5;
        }
        if (this.bounceRight) {
            this.x += 5;
        } else {
            this.x -= 5;
        }
    }

    if(this.explosionAnimation.isDone()){
        this.removeFromWorld = true;
    }

    Entity.prototype.update.call(this);
}

GasMan.prototype.draw = function (ctx) {
    if (this.game.up) {
        this.climbAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);
    } else if (this.game.left) {
        this.rollLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);
    } else if (this.game.right) {
        this.rollRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);
    } else if (this.jumping) {
        this.stillAnimationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);
    } else if (this.game.shooting && this.health > 1) {
        this.shootAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);
    } else if (this.dying) {
        this.explosionAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);
    } else if (this.game.charging) {
        this.charging.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);
    } else if (this.game.punchAnimation) {
        this.punchAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);
    } else {
        this.stillAnimationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);
    }
    Entity.prototype.draw.call(this);
}

GasMan.prototype.collision = function(other) {
    return Math.abs(this.x - other.x) < 100;
}

function ShieldGuy(game) {
    this.bounceUp = true;
    this.type = 'a';
    this.x = 600;
    this.y = 600;
    this.stillAnimationRight = new Animation(ASSET_MANAGER.getAsset("./img/armyDude.png"), 0, 0, 35, 43, 0.1, 12, true, false);


    Entity.call(this, game, this.x, this.y);
}

ShieldGuy.prototype = new Entity();
ShieldGuy.prototype.constructor = ShieldGuy;


ShieldGuy.prototype.update = function() {
    // if (this.health < 1) {
    //     this.dying = true;
    //     console.log("GasMan has fallen...");
    //     if (!this.deathSoundStarted) {
    //         this.deathSoundStarted = true;
    //         this.deathSound.play();
    //     }
    // }

    // if (this.dying && this.explosionAnimation.elapsedTime > this.explosionAnimation.totalTime) {
    //     this.removeFromWorld = true;
    // }

    // if (this.game.shooting && this.shootingCount % 50 == 0) {
    //     var shovel = new Bullet(this.game, this);
    //     this.game.addEntity(shovel);
    //     //this.shovelCount++;
    //     this.x -= 1;
    //     this.shootingCount++;
    // } else if (this.game.shooting) {
    //     this.shootingCount++;
    // }

    // for (var i = 0; i < this.game.entities.length; i++) {
    //     var ent = this.game.entities[i];
    //     if (this != ent && this.collision(ent)) {
    //         ent.removeFromWorld = true;
    //         this.health--;
    //         console.log("GasMan has been hit! His health is at " + this.health);
    //     }
    // }



    Entity.prototype.update.call(this);
}

ShieldGuy.prototype.draw = function (ctx) {

    this.stillAnimationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3.0);

    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/gasmask_climb.gif");
ASSET_MANAGER.queueDownload("./img/gasmask_dead.gif");
ASSET_MANAGER.queueDownload("./img/explosion.png");
ASSET_MANAGER.queueDownload("./img/gasmask_shoot.gif");
ASSET_MANAGER.queueDownload("./img/gasmask_still_right.gif");
ASSET_MANAGER.queueDownload("./img/gasmask_walk_left.gif");
ASSET_MANAGER.queueDownload("./img/gasmask_walk_right.gif");
ASSET_MANAGER.queueDownload("./img/fireball.gif");
ASSET_MANAGER.queueDownload("./img/armyDude.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');



    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    // var unicorn = new Unicorn(gameEngine);
    var megaman1 = new GasMan(gameEngine);
    //var shovel = new Bullet(gameEngine, megaman1);
    var armyDude = new ShieldGuy(gameEngine);

    ctx.canvas.addEventListener("keypress", function(e) {
        if (String.fromCharCode(e.which) === 'a') {
            var tempMega = new GasMan(gameEngine, Math.floor(Math.random() * 800), Math.floor(Math.random() * 800));
            if (Math.floor(Math.random() * 2)) {
                tempMega.bounceRight = false;
            }
            if (Math.floor(Math.random() * 2)) {
                tempMega.bounceUp = false;
            }
            gameEngine.addEntity(tempMega);
        }
        e.preventDefault();
        // console.log(e);
    }, false);

    ctx.canvas.addEventListener("keypress", function(e) {
        if (String.fromCharCode(e.which) === 'd') {
            gameEngine.deleteLastAdded();
        }
        e.preventDefault();
        // console.log(e);
    }, false);



    gameEngine.addEntity(bg);
    // gameEngine.addEntity(unicorn);
    gameEngine.addEntity(megaman1);
    // gameEngine.addEntity(shovel);
    gameEngine.addEntity(armyDude);

    gameEngine.init(ctx);
    gameEngine.start();


    //saveButton.addEventListener("click", function () {
    document.getElementById("save").onclick = function save() {
        console.log("save button clicked");
        var saveList = [];

        //store all players' bullets
        //ID = 6, x, y, dx, dy, size, life, speed, angle
        for (var i = 0; i < gameEngine.entities.length; i++) {
            var temp = gameEngine.entities[i];
            if(temp.type === 'b'){
                saveList.push({type: temp.type, x: temp.x, y:temp.y, bounce: temp.bounce});
            }
            if(temp.type === 'g'){
                saveList.push({type: temp.type, x: temp.x, y:temp.y, health: temp.health});
            }
            if(temp.type === 'a'){
                saveList.push({type: temp.type, x: temp.x, y:temp.y});
            }
        }

        console.log(saveList.length);
        //console.log(entitiesList);
        socket.emit("save", { studentname: "Richard Ung", statename: "gasMan", data: saveList });
        //});
    };

    //load function
    //var loadButton = document.createElement("Button");
    //loadButton.innerHTML = "Load";
    //var body = document.getElementsByTagName("body")[0];
    //body.appendChild(loadButton);
    //loadButton.addEventListener("click", function () {
    document.getElementById("load").onclick = function load() {
        console.log("load button clicked");

        socket.emit("load", { studentname: "Richard Ung", statename: "gasMan" });

        socket.on("load", function (data) {
            gameEngine.entities = [];
            var bg = new Background(gameEngine);
            gameEngine.addEntity(bg);

            var obj = data.data;
            console.log("load object length: " + obj.length);

            var gas = new GasMan(gameEngine);
            for (var i = 0; i < obj.length; i++) {
                var temp = obj[i];
                switch (temp.type) {
                    case 'b':
                        var bullet = new Bullet(gameEngine, gas);
                        bullet.x = temp.x;
                        bullet.y = temp.y;
                        bullet.bounce = temp.bounce;
                        gameEngine.addEntity(bullet);
                        break;
                    case 'g':
                        gas.x = temp.x;
                        gas.y = temp.y;
                        gas.health = temp.health;
                        gameEngine.addEntity(gas);
                        break;
                    //case 2:
                    //    mainGame.enemies = new Enemies(temp.enemies_color);
                    //    mainGame.enemyBullets = new Bullets(temp.ebullet_color);
                    //    mainGame.playerBullets = new Bullets(temp.player_bullet);
                    //    break;
                    case 'a':
                        var shield = new ShieldGuy(gameEngine);
                        shield.x = temp.x;
                        shield.y = temp.y;
                        gameEngine.addEntity(shield);
                        break;

                }
            }

        });

    };
});

var socket = io.connect("http://76.28.150.193:8888");