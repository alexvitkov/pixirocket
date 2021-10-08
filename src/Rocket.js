import * as Config from "./Config";
import FuelBar from "./FuelBar";
import FloatingBottomPart from "./FloatingBottomPart";
import app from "./App";
import { timeScale } from "./App";
import * as ScreenText from "./ScreenText";
import { random, lerp, clamp } from "./Util";

// Load the rocket textures
const rocketTopTexture = PIXI.Texture.from("assets/rocket_top.png");
const rocketBottomTexture = PIXI.Texture.from("assets/rocket_bottom.png");
const thrustTexture = PIXI.Texture.from("assets/thrust.png");

export default class Rocket {
    constructor(x, rocketData) {

        this.rocketData = rocketData;

        // Current stage of the rocket, either 1 or 2
        this.stage = 1;

        // Load the fuel capacity from the rocket data
        this.stage1Fuel = rocketData.first_stage.fuel_amount_tons;;
        this.stage2Fuel = rocketData.second_stage.fuel_amount_tons;;

        // Current fuel value
        this.fuel = this.stage1Fuel + this.stage2Fuel;

        // This gets set to true from this.launch() after the initial countdown
        this.launched = false;

        // Container for the rocket sprites, the label, the thrust and the fuel bars
        this.container = new PIXI.Container();

        // We resize the rockets based on the data from the JSON to make them look nicer
        this.rocketScale = rocketData.height.meters * Config.ROCKET_SCALE;
        this.rocketSize = this.rocketScale * (rocketTopTexture.height + rocketBottomTexture.height);

        // Create the rocket itself
        this.rocketTop = new PIXI.Sprite(rocketTopTexture);
        this.rocketTop.anchor.set(0.5, 1.5);
        this.rocketTop.scale.set(this.rocketScale)

        this.rocketBottom = new PIXI.Sprite(rocketBottomTexture);
        this.rocketBottom.scale.set(this.rocketScale);
        this.rocketBottom.anchor.set(0.5, .5);
        this.rocketBottom.y = -rocketBottomTexture.height * this.rocketScale * 0.5;


        // Create the thrust
        this.thrustSprite = new PIXI.Sprite(thrustTexture);
        this.thrustSprite.anchor.set(0.5, 0.1);

        // The order in which we add the sprites matters
        // the thrust must be behind rocketBottom
        this.container.addChild(this.thrustSprite);
        this.container.addChild(this.rocketBottom);
        this.container.addChild(this.rocketTop);

        // Create a label to show the rocket name
        let label = new PIXI.Text(rocketData.name, { fontFamily: 'Arial', fontSize: 20, fill: 0xffffff });
        label.anchor.set(0.5);
        label.y = -this.rocketSize - 15;
        this.container.addChild(label);

        // Stage 1 fuel bar
        this.fuelBar1 = new FuelBar(10, this.rocketSize);
        this.container.addChild(this.fuelBar1.container);
        this.fuelBar1.container.x = this.rocketTop.width/2 + 5;

        // Stage 2 fuel bar
        this.fuelBar2 = new FuelBar(10, this.rocketSize * this.stage2Fuel / (this.stage1Fuel + this.stage2Fuel));
        this.container.addChild(this.fuelBar2.container);
        this.fuelBar2.container.x = this.fuelBar1.container.x + 10;

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
        ScreenText.write(`${this.rocketData.name} launched!`);
        app.ticker.remove(this.tickFn);
    }

    updateY() {
        let p = this.fuel / (this.stage1Fuel + this.stage2Fuel);

        // Rockets don't launch at a constant speed, they get faster
        // fade-in interpolation looks nicer.
        p = 1 - (1 - p) * (1 - p); 

        let oldY = this.container.y;
        let newY = (Config.SCREEN_HEIGHT ) * p;
        this.container.y = newY;

        // yVelocity is needed for when we lose the bottom part of the rocket
        // so we can give it a sensible initial velocity
        // this is not accurate at all but works OK for that purpose
        this.yVelocity = (newY - oldY) / app.ticker.deltaTime;
    }

    enterStage2() {
        if (this.stage == 2)
            return;

        this.stage = 2;

        // Lose the bottom part
        new FloatingBottomPart(this.rocketBottom, clamp(this.yVelocity, -10, 0));

    }

    tick() {
        this.updateY();

        if (!this.launched)
            return;

        const dt = app.ticker.deltaTime;

        this.fuel -= timeScale * dt;

        if (this.fuel < this.stage2Fuel && this.stage == 1)
            this.enterStage2();

        if (this.fuel <= 0) {
            this.destroy();
            return;
        }

        this.thrustSprite.rotation = Math.random() * 0.1;
        this.thrustSprite.scale.set(this.rocketScale * random(0.9, 1.1));

        this.fuelBar1.update(clamp((this.fuel - this.stage2Fuel) / this.stage1Fuel, 0, 1));
        this.fuelBar2.update(clamp(this.fuel / this.stage2Fuel, 0, 1));

        if (this.stage == 2) {
            // dirty hack to reposition the thrust sprite after the second stage
            // so it doesn't float where the bottom part used to be
            const thrustTargetY = -this.rocketScale * rocketBottomTexture.height;
            this.thrustSprite.y = lerp(this.thrustSprite.y, thrustTargetY, 0.1 * dt);
        }


    }
};
