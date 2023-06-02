class Logo extends Phaser.Scene {
    constructor() {
        super('logo')
    }
    preload() {
        // load path use assets/
        this.load.path = "./assets/";
        this.load.image("logo", "logo.png");
    }
    create() {
        // create method
        // set background color
        this.cameras.main.setBackgroundColor(0x000000);
        
        // animation effects
        this.cameras.main.fadeIn(500, 0, 0, 0);

        let logo = this.add.image(
            game.canvas.width / 2, -300,
            "logo"
        );

        this.tweens.add({
            targets: logo,
            y: game.canvas.height / 2 - 50,
            alpha: 1,
            delay: 1000,
            duration: 2000,
            ease: "Linear",
            repeat: 0
        });

        this.tweens.add({
            targets: logo,
            y: game.canvas.height + 300,
            alpha: 1,
            delay: 5000,
            duration: 2000,
            ease: "Linear",
            repeat: 0,
            onComplete: () => this.scene.start('rule')
        });
        // setTimeout(() => {
        //     this.cameras.main.fade(500, 0, 0, 0);
        //     this.time.delayedCall(500, () => 
        // }, 7000);
    }
}

class Rule extends Phaser.Scene {
    constructor() {
        super('rule');
    }
    preload() {
        this.load.path = "./assets/";
        this.load.image("rule", "rule.png");
    }
    create() {
        this.add.image(game.canvas.width / 2, game.canvas.height / 2, "rule").setDisplaySize(game.canvas.width, game.canvas.height);

        this.input.on('pointerdown', () => {
            this.scene.start('main', { level: 1 })
        });
    }
}

class Main extends Phaser.Scene {
    constructor() {
        super("main");
    }
    preload() {
        // assets path
        this.load.path = "./assets/";
        // add background picture
        this.load.image("bg", "bg.jpg");
        // add player picture
        this.load.image("player", "player.png");
        // add enemy.png picture
        this.load.image("enemy", "enemy.png");
    }
    create() {
        this.add.image(
            game.canvas.width / 2, game.canvas.height / 2,
            "bg"
        ).setDisplaySize(game.canvas.width, game.canvas.height);

        this.player = this.matter.add.image(400, 300, 'player');
        this.player.setCollisionGroup(0b00001);
        // this.player.setCollidesWith([11]);

        this.player.setFixedRotation();
        this.player.setMass(10);
        this.player.setAngle(270);
        this.playerRect = new Phaser.Geom.Rectangle(0, 0, this.player.height, this.player.width);

        // set bounds
        this.matter.world.setBounds(0, 0, game.canvas.width, game.canvas.height);
        this.cursors = this.input.keyboard.createCursorKeys();

        const LEVEL_TIME = 30
        let timeLeft = LEVEL_TIME;
        let timeLeftText = this.add.text(10, 10, 'Time Left: ' + timeLeft, { fontSize: '32px', fontFamily: 'Arial Black', fill: '#000' });

        this.level = this.scene.settings.data.level || 1;
        let levelText = this.add.text(10, 50, 'Level: ' + this.level, { fontSize: '32px', fontFamily: 'Arial Black', fill: '#000' });
        window.interval = setInterval(() => {
            if (timeLeft === 0) {
                window.clearInterval(window.interval);
                if (this.level === 1) {
                    this.scene.start('hint1');
                } else if (this.level === 2) {
                    this.scene.start('hint2');
                } else if (this.level === 3) {
                    this.scene.start('outro');
                }
                levelText.setText(`Level: ${++this.level}`);
                timeLeft = LEVEL_TIME;
            }
            timeLeftText.setText(`Time Left: ${timeLeft--}`);
        }, 1000);

        this.health = 3;
        this.healthRect = this.add.graphics();
        this.healthRect.fillStyle(0xFF0000, 1);
        this.redrawHealthRect();
        this.add.text(game.canvas.width - 200, 15, 'Health', { fontSize: '16px', fontFamily: 'Arial Black', fill: '#F00' });

        this.missileArray = []
        let counter = 1;
        // add event 
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                let side = Phaser.Math.Between(0, 360);
                // console.log(side)
                const angle = 2 * Math.PI * side / 360;

                const old = this.missileArray.find(m => m.visible === false);;
                // check if the aircraft has collided
                if (!old)
                    this.missileArray.push(this.fireMissile(400 + 500 * Math.cos(angle), 300 + 500 * Math.sin(angle), angle, counter++));
                else {
                    old.visible = true;
                    old.x = 400 + 500 * Math.cos(angle);
                    old.y = 300 + 500 * Math.sin(angle);
                    old.rotation = angle + Math.PI;
                    old.setVelocity(-Math.cos(angle) * this.level, -Math.sin(angle) * this.level);
                }
            }
        });
    }
    redrawHealthRect() {
        this.healthRect.clear();
        this.healthRect = this.add.graphics();
        this.healthRect.fillStyle(0xFF0000, 1);
        for (let i = 0; i < this.health; i++) {
            this.healthRect.fillRect(game.canvas.width - 200 + i * 60, 35, 50, 20);
        }
    }
    fireMissile(x, y, angle, counter) {
        let missile = this.matter.add.image(x, y, 'enemy');
        missile.setScale(0.2)
        missile.setCollisionGroup(0b00010 + counter);
        missile.setCollidesWith([]);

        missile.rotation = angle + Math.PI;
        missile.setFrictionAir(0);
        missile.setBounce(0);
        missile.setVelocity(-Math.cos(angle) * this.level, -Math.sin(angle) * this.level);
        return missile;
    }
    update() {
        const speed = 8;
        if (this.cursors.left.isDown) {
            this.player.x -= speed;
        }
        else if (this.cursors.right.isDown) {
            this.player.x += speed;
        }

        if (this.cursors.up.isDown) {
            this.player.y -= speed;
        }
        else if (this.cursors.down.isDown) {
            this.player.y += speed;
        }
        const v = this.player.getTopRight();
        this.playerRect.x = v.x;
        this.playerRect.y = v.y;

        this.missileArray.forEach(m => {
            if (!m.visible) return;
            const tl = m.getTopLeft()
            const tr = m.getTopRight()
            const br = m.getBottomRight()
            const bl = m.getBottomLeft();
            var tri1 = new Phaser.Geom.Triangle(tl.x, tl.y, tr.x, tr.y, br.x, br.y);
            var tri2 = new Phaser.Geom.Triangle(tl.x, tl.y, br.x, br.y, bl.x, bl.y);
            if (Phaser.Geom.Intersects.GetRectangleToTriangle(this.playerRect, tri1).length || Phaser.Geom.Intersects.GetRectangleToTriangle(this.playerRect, tri2).length) {
                m.visible = false;
                this.health--;
                if (this.health === 0) {
                    window.clearInterval(window.interval);
                    this.scene.start('rule');
                }
                this.redrawHealthRect();
            } else if (m.x < -100 || m.x > game.canvas.width + 100 || m.y < -200 || m.y > game.canvas.height + 200) {
                m.visible = false;
                console.log('out')
            }
        })
    }
}

class Hint1 extends Phaser.Scene {
    constructor() {
        super('hint1');
    }
    preload() {
        this.load.path = "./assets/";
        this.load.image("hint1", "hint1.png");
    }
    create() {
        this.add.image(game.canvas.width / 2, game.canvas.height / 2, "hint1").setDisplaySize(game.canvas.width, game.canvas.height);

        this.input.on('pointerdown', () => {
            this.scene.start('main', { level: 2 });
        });
    }
}
class Hint2 extends Phaser.Scene {
    constructor() {
        super('hint2');
    }
    preload() {
        this.load.path = "./assets/";
        this.load.image("hint2", "hint2.png");
    }
    create() {
        this.add.image(game.canvas.width / 2, game.canvas.height / 2, "hint2").setDisplaySize(game.canvas.width, game.canvas.height);

        this.input.on('pointerdown', () => {
            this.scene.start('main', { level: 3 });
        });
    }
}


class Outro extends Phaser.Scene {
    constructor() {
        super('outro');
    }
    preload() {
        this.load.path = "./assets/";
        this.load.image("win", "win.png");
    }
    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        let win = this.add.image(game.canvas.width / 2, game.canvas.height / 2, "win");
        win.setDisplaySize(game.canvas.width / 2, game.canvas.height / 2);
    }
}

