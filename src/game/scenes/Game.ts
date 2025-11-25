import Phaser from "phaser";

export class Game extends Phaser.Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    ballA: Phaser.Physics.Matter.Image;
    ballB: Phaser.Physics.Matter.Image;
    ended = false;

    constructor() {
        super("Game");
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("ball", "shinyball.png");
    }

    create() {
        this.ended = false;

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.matter.world.setBounds();

        const ballOptions: Phaser.Types.Physics.Matter.MatterBodyConfig = {
            shape: "circle",
            friction: 0.005,
            restitution: 0.6,
        };

        this.ballA = this.matter.add.image(
            420,
            100,
            "ball",
            undefined,
            ballOptions
        );

        this.ballB = this.matter.add.image(
            400,
            200,
            "ball",
            undefined,
            ballOptions
        );

        this.matter.add.constraint(
            this.ballA.body as MatterJS.BodyType,
            this.ballB.body as MatterJS.BodyType,
            100,
            0.2
        );

        this.matter.add.mouseSpring();

        this.msg_text = this.add.text(
            512,
            40,
            "Drag the balls and don't let them hit the right wall.",
            {
                fontFamily: "Arial Black",
                fontSize: 28,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            }
        );
        this.msg_text.setOrigin(0.5, 0);

        this.setupCollisionHandlers();
    }

    private setupCollisionHandlers() {
        this.matter.world.on(
            "collisionstart",
            (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
                if (this.ended) {
                    return;
                }

                const rightWall = this.matter.world.walls?.right;

                if (!rightWall) {
                    return;
                }

                for (const pair of event.pairs) {
                    const { bodyA, bodyB } = pair;

                    const hitsRightWall =
                        (bodyA === rightWall &&
                            (bodyB === this.ballA.body || bodyB === this.ballB.body)) ||
                        (bodyB === rightWall &&
                            (bodyA === this.ballA.body || bodyA === this.ballB.body));

                    if (hitsRightWall) {
                        this.ended = true;
                        this.scene.start("GameOver");
                        break;
                    }
                }
            }
        );
    }
}
