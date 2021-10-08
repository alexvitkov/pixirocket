import * as Config from "./Config";
import FuelBar from "./FuelBar";
import FloatingBottomPart from "./FloatingBottomPart";
import app from "./App";
import * as ScreenText from "./ScreenText";
import { random, lerp, clamp } from "./Util";

// Load the rocket textures
const rocketTopTexture = PIXI.Texture.from("assets/rocket_top.png");
const rocketBottomTexture = PIXI.Texture.from("assets/rocket_bottom.png");
const thrustTexture = PIXI.Texture.from("assets/thrust.png");

export default class Rocket {
    constructor(x, rocketData) {
        this.stage = 1;

        this.stage1Fuel = rocketData.first_stage.fuel_amount_tons;;
        this.stage2Fuel = rocketData.second_stage.fuel_amount_tons;;
        this.fuel = this.stage1Fuel + this.stage2Fuel;

        this.rocketData = rocketData;
        this.launched = false;

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

        // Stage 1 fuel bar
        this.fuelBar1 = new FuelBar(10, this.rocketSize);
        this.container.addChild(this.fuelBar1.container);
        this.fuelBar1.container.x = this.rocketSprite.width/2 + 5;

        // Stage 2 fuel bar
        this.fuelBar2 = new FuelBar(10, this.rocketSize * this.stage2Fuel / (this.stage1Fuel + this.stage2Fuel));
        this.container.addChild(this.fuelBar2.container);
        this.fuelBar2.container.x = this.rocketSprite.width/2 + 15;

        // Initial position of the container
        this.container.x = x;
        app.stage.addChild(this.container);

        // Register tick function
        this.tickFn = this.tick.bind(this);
        app.ticker.add(this.tickFn);
    }

    launch() {
        this.launched = true;
    }

    destroy() {
        this.container.destroy();
        ScreenText.write(this.rocketData.name + " launched!");
        app.ticker.remove(this.tickFn);
    }

    updateY() {
        let p = this.fuel / (this.stage1Fuel + this.stage2Fuel);

        p = 1 - (1 - p) * (1 - p); // square interpolation looks nicer

        let new_y = (Config.SCREEN_HEIGHT ) * p ;
        let old_y = this.container.y;
        this.container.y = new_y;

        // this is needed for when we lose the bottom part,
        // to give it a sensible initial velocity
        this.yVelocity = (new_y - old_y) / app.ticker.deltaTime;
    }

    enter_stage2() {
        if (this.stage == 2)
            return;

        // Lose the bottom part
        new FloatingBottomPart(this.rocketBottomSprite, clamp(this.yVelocity, -10, 0));

        this.stage = 2;
    }

    tick() {
        this.updateY();

        if (!this.launched)
            return;

        this.fuel -= app.ticker.deltaTime;

        if (this.fuel < this.stage2Fuel && this.stage == 1)
            this.enter_stage2();

        if (this.fuel <= 0) {
            this.destroy();
            return;
        }

        this.thrustSprite.rotation = Math.random() * 0.1;
        this.thrustSprite.scale.set(this.rocketScale * random(0.9, 1.1));

        this.fuelBar1.update(clamp((this.fuel - this.stage2Fuel) / this.stage1Fuel, 0, 1));
        this.fuelBar2.update(clamp(this.fuel / this.stage2Fuel, 0, 1));

        if (this.stage == 2) {
            this.thrustAnchor = lerp(this.thrustAnchor, 0.5, 0.1 * app.ticker.deltaTime);
            this.thrustSprite.anchor.set(0.5, this.thrustAnchor);
        }


    }
};
