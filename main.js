console.log(PIXI)

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ROCKET_SCALE = 1.5;
const ROCKET_SPEED = 2;

const app = new PIXI.Application({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
});
document.body.appendChild(app.view);


// Load the background
const background = PIXI.Sprite.from("assets/bg.jpg");
background.width = CANVAS_WIDTH;
background.height = CANVAS_HEIGHT;
app.stage.addChild(background);

// Load the rocket textures
const rocketTexture = PIXI.Texture.from("assets/rocket.png");

let time = 0.0;

class Rocket {
    constructor(x, rocketData) {
        this.rocketData = rocketData;

        this.container = new PIXI.Container();
        
        const rocketScale = rocketData.height.meters * ROCKET_SCALE / rocketTexture.height;

        this.rocketSprite = new PIXI.Sprite(rocketTexture);
        this.rocketSprite.anchor.set(0.5, 1);
        this.container.addChild(this.rocketSprite);

        this.rocketSprite.width = rocketScale * rocketTexture.width;
        this.rocketSprite.height = rocketScale * rocketTexture.height;

        this.container.x = x;
        this.container.y = CANVAS_HEIGHT;

        app.stage.addChild(this.container);

        app.ticker.add(this.tick.bind(this));
    }

    tick(dt) {
        this.container.y -= ROCKET_SPEED * dt;
        this.container.rotation = Math.random() * 0.05;
    }
};



async function loadRockets() {
    const resp = await fetch("https://api.spacexdata.com/v2/rockets");
    const rocketsData = await resp.json();

    let x = 0;

    for (const rocketData of rocketsData) {
        new Rocket(x, rocketData);
        x += 150;
    }
}

loadRockets();


// const rocketTexture = PIXI.Texture.from("assets/rocket.png");
// const rocketSprite = new PIXI.Sprite(rocketTexture);
