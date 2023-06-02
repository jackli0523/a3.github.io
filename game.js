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
