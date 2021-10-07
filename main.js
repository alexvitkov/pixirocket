console.log(PIXI)

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ROCKET_SCALE = 1.5;
const ROCKET_SPEED = 2;
const START_Y = CANVAS_HEIGHT - 30;

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

class FuelBar {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.container = new PIXI.Container();
        this.container.y = -height;

        this.fuelBar = new PIXI.Graphics();
        this.container.addChild(this.fuelBar);

        this.update(1.0);
    }

    update(percentage) {
        this.fuelBar.clear();

        this.fuelBar.beginFill(0x000000);
        this.fuelBar.lineStyle(2, 0xFF0000);
        this.fuelBar.drawRect(0, 0, this.width, this.height);

        this.fuelBar.beginFill(0xFFFF00);
        this.fuelBar.lineStyle(2, 0xFF0000);
        this.fuelBar.drawRect(0, (1.0 - percentage) * this.height, this.width, percentage * this.height);
    }
}

class Rocket {
    constructor(x, rocketData) {
        this.initialFuel1 = this.fuel1 = rocketData.first_stage.fuel_amount_tons;
        this.initialFuel2 = this.fuel2 = rocketData.second_stage.fuel_amount_tons;

        this.rocketData = rocketData;

        this.container = new PIXI.Container();

        // The label that shows the rocket's name under the sprite
        let label = new PIXI.Text(rocketData.name, { fontFamily: 'Arial', fontSize: 20, fill: 0xffffff });
        this.container.addChild(label);
        label.anchor.set(0.5);
        label.y = 10;


        // The rocket sprite itself
        this.rocketSprite = new PIXI.Sprite(rocketTexture);
        this.rocketSprite.anchor.set(0.5, 1);
        this.container.addChild(this.rocketSprite);

        const rocketScale = rocketData.height.meters * ROCKET_SCALE / rocketTexture.height;
        this.rocketSprite.width = rocketScale * rocketTexture.width;
        this.rocketSprite.height = rocketScale * rocketTexture.height;


        // Fuel bar
        this.fuelBar1 = new FuelBar(10, this.rocketSprite.height);
        this.container.addChild(this.fuelBar1.container);
        this.fuelBar1.container.x = this.rocketSprite.width/2 + 5;

        this.fuelBar2 = new FuelBar(10, this.rocketSprite.height);
        this.container.addChild(this.fuelBar2.container);
        this.fuelBar2.container.x = this.rocketSprite.width/2 + 15;

        // Initial position of the container
        this.container.x = x;
        this.container.y = START_Y;
        app.stage.addChild(this.container);

        // Register tick function
        app.ticker.add(this.tick.bind(this));
    }

    tick(dt) {
        if (this.fuel1 > 0) {
            this.fuel1 -= app.ticker.deltaTime;
            if (this.fuel1 < 0)
                this.fuel1 = 0;
        }
        else {
            this.fuel2 -= app.ticker.deltaTime;
            if (this.fuel2 < 0)
                this.fuel2 = 0;
        }

        this.fuelBar1.update(this.fuel1 / this.initialFuel1);
        this.fuelBar2.update(this.fuel2 / this.initialFuel2);

        this.container.y -= ROCKET_SPEED * dt;

    }
};



async function loadRockets() {
    const resp = await fetch("https://api.spacexdata.com/v2/rockets");
    const rocketsData = await resp.json();

    let xAdd = CANVAS_WIDTH / (rocketsData.length + 1);
    let x = xAdd;

    for (const rocketData of rocketsData) {
        new Rocket(x, rocketData);
        x += xAdd;
    }
}

loadRockets();

// const rocketTexture = PIXI.Texture.from("assets/rocket.png");
// const rocketSprite = new PIXI.Sprite(rocketTexture);
