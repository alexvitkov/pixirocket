console.log(PIXI)

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ROCKET_SCALE = 0.015;
const ROCKET_SPEED = 2;
const BOTTOM_Y_OFFSET = 30;

const BOTTOM_PART_GRAVITY_SCALE = 0.14;
const BOTTOM_PART_ROTATION_SCALE = 0.001;
const BOTTOM_PART_MAX_ROTATION_SPEED = 0.1;
const BOTTOM_PART_SCALE_DECREASE_SCALE = 0.003;

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
const rocketTopTexture = PIXI.Texture.from("assets/rocket_top.png");
const rocketBottomTexture = PIXI.Texture.from("assets/rocket_bottom.png");
const thrustTexture = PIXI.Texture.from("assets/thrust.png");

let time = 0.0;

function lerp(min, max, t) {
    return t * (max - min) + min;
}

function random(min, max) {
    return lerp(min, max, Math.random());
}

function clamp(val, min, max) {
    if (val < min)
        return min;
    if (val > max)
        return max;
    return val;
}


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

class FloatingBottomPart {
    constructor(sprite, initialVelocity) {
        this.sprite = sprite;
        this.velocity = initialVelocity;
        this.angularVelocity = 0;
        this.xAcceleration = random(-.1, .1);

        const pos = sprite.getGlobalPosition();
        sprite.parent.removeChild(sprite);

        app.stage.addChild(sprite);
        sprite.x = pos.x;
        sprite.y = pos.y;

        this.tickFn = this.tick.bind(this);
        app.ticker.add(this.tickFn);
    }

    tick() {
        const dt = app.ticker.deltaTime;
        this.velocity += BOTTOM_PART_GRAVITY_SCALE * dt;
        this.angularVelocity += BOTTOM_PART_ROTATION_SCALE * dt;
        if (this.angularVelocity > BOTTOM_PART_MAX_ROTATION_SPEED)
            this.angularVelocity = BOTTOM_PART_MAX_ROTATION_SPEED;
            

        this.sprite.y += BOTTOM_PART_GRAVITY_SCALE * this.velocity;
        this.sprite.rotation += this.angularVelocity * dt;
        this.sprite.scale.set(this.sprite.scale.x - BOTTOM_PART_SCALE_DECREASE_SCALE * dt);

        if (this.sprite.scale.x < 0) {
            app.ticker.remove(this.tickFn);
            this.sprite.destroy();
        }
    }
}

class Rocket {
    constructor(x, rocketData) {
        this.initialFuel1 = this.fuel1 = rocketData.first_stage.fuel_amount_tons;
        this.initialFuel2 = this.fuel2 = rocketData.second_stage.fuel_amount_tons;

        this.rocketData = rocketData;

        this.container = new PIXI.Container();

        // The rocket sprite itself
        this.rocketSprite = new PIXI.Sprite(rocketTopTexture);
        this.rocketBottomSprite = new PIXI.Sprite(rocketBottomTexture);
        this.rocketSprite.anchor.set(0.5, 1.5);
        this.rocketBottomSprite.anchor.set(0.5, .5);

        this.rocketScale = rocketData.height.meters * ROCKET_SCALE;
        this.rocketSize = this.rocketScale * (rocketTopTexture.height + rocketBottomTexture.height);

        this.rocketBottomSprite.y = -rocketBottomTexture.height * this.rocketScale * 0.5;

        this.rocketSprite.scale.set(this.rocketScale)
        this.rocketBottomSprite.scale.set(this.rocketScale);

        this.thrustSprite = new PIXI.Sprite(thrustTexture);
        this.thrustAnchor = 0.1;
        this.thrustSprite.anchor.set(0.5, this.thrustAnchor);

        this.container.addChild(this.thrustSprite);
        this.container.addChild(this.rocketSprite);
        this.container.addChild(this.rocketBottomSprite);

        // The label that shows the rocket's name under the sprite
        let label = new PIXI.Text(rocketData.name, { fontFamily: 'Arial', fontSize: 20, fill: 0xffffff });
        this.container.addChild(label);
        label.anchor.set(0.5);
        label.y = -this.rocketSize - 15;

        // Fuel bar
        this.fuelBar1 = new FuelBar(10, this.rocketSize);
        this.container.addChild(this.fuelBar1.container);
        this.fuelBar1.container.x = this.rocketSprite.width/2 + 5;

        this.fuelBar2 = new FuelBar(10, this.rocketSize * this.fuel2 / this.fuel1);
        this.container.addChild(this.fuelBar2.container);
        this.fuelBar2.container.x = this.rocketSprite.width/2 + 15;

        // Initial position of the container
        this.container.x = x;
        app.stage.addChild(this.container);

        // Register tick function
        app.ticker.add(this.tick.bind(this));
    }

    lose_bottom_part() {
        new FloatingBottomPart(this.rocketBottomSprite, clamp(this.yVelocity, -10, 0));
    }

    get_fuel_percentage() {
        return (this.fuel1 + this.fuel2) / (this.initialFuel1 + this.initialFuel2);
    }


    update_y() {
        let p = this.get_fuel_percentage();

        p = 1 - (1 - p) * (1 - p); // square interpolation looks nicer

        let new_y = (CANVAS_HEIGHT - this.rocketSize) * p + this.rocketSize;
        let old_y = this.container.y;
        this.container.y = new_y;

        // this is needed for when we lose the bottom part,
        // to give it a sensible initial velocity
        this.yVelocity = (new_y - old_y) / app.ticker.deltaTime;
    }

    tick() {
        if (this.fuel1 > 0) {
            this.fuel1 -= app.ticker.deltaTime;
            if (this.fuel1 <= 0) {
                this.fuel1 = 0;
                this.lose_bottom_part();
            }
        }
        else {
            this.fuel2 -= app.ticker.deltaTime;
            if (this.fuel2 < 0)
                this.fuel2 = 0;

            this.thrustAnchor = lerp(this.thrustAnchor, 0.5, 0.1 * app.ticker.deltaTime);
            this.thrustSprite.anchor.set(0.5, this.thrustAnchor);
        }


        this.fuelBar1.update(this.fuel1 / this.initialFuel1);
        this.fuelBar2.update(this.fuel2 / this.initialFuel2);

        this.update_y();

        this.thrustSprite.rotation = Math.random() * 0.1;
        this.thrustSprite.scale.set(this.rocketScale * random(0.9, 1.1));
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
