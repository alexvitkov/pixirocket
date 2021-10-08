import * as Config from "./Config";
import FuelBar from "./FuelBar";
import FloatingBottomPart from "./FloatingBottomPart";
import app from "./App";
import { random, lerp, clamp } from "./Util";

// Load the rocket textures
const rocketTopTexture = PIXI.Texture.from("assets/rocket_top.png");
const rocketBottomTexture = PIXI.Texture.from("assets/rocket_bottom.png");
const thrustTexture = PIXI.Texture.from("assets/thrust.png");

export default class Rocket {
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

        this.rocketScale = rocketData.height.meters * Config.ROCKET_SCALE;
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
        this.tickFn = this.tick.bind(this);
        app.ticker.add(this.tickFn);
    }

    destroy() {
        this.container.destroy();
        app.ticker.remove(this.tickFn);
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

        let new_y = (Config.CANVAS_HEIGHT - this.rocketSize) * p + this.rocketSize;
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
            if (this.fuel2 < 0) {
                this.fuel2 = 0;

                this.destroy();
                return;
            }

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
