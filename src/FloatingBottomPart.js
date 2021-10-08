import { random, lerp, clamp } from "./Util";
import * as Config from "./Config";

export default class FloatingBottomPart {
    constructor(sprite, initialVelocity) {
        this.sprite = sprite;

        this.velocity = initialVelocity;
        this.angularVelocity = 0;

        // Get the global position of the sprite, so we can preserve it
        // after we reparent it to the root stage
        const pos = sprite.getGlobalPosition();
        app.stage.addChild(sprite);
        sprite.x = pos.x;
        sprite.y = pos.y;

        this.tickFn = this.tick.bind(this);
        app.ticker.add(this.tickFn);
    }

    tick() {
        const dt = app.ticker.deltaTime;
        this.velocity += Config.BottomPart.GRAVITY_SCALE * dt;

        this.angularVelocity += Config.BottomPart.ROTATION_SCALE * dt;
        if (this.angularVelocity > Config.BottomPart.MAX_ROTATION_SPEED)
            this.angularVelocity = Config.BottomPart.MAX_ROTATION_SPEED;

        this.sprite.y += Config.BottomPart.GRAVITY_SCALE * this.velocity;
        this.sprite.rotation += this.angularVelocity * dt;

        // The scale decreases over time to give the effect the part is flying away
        // We delete the object after it reaches 0
        this.sprite.scale.set(this.sprite.scale.x - Config.BottomPart.SCALE_DECREASE * dt);
        if (this.sprite.scale.x < 0) {
            app.ticker.remove(this.tickFn);
            this.sprite.destroy();
        }
    }
}
