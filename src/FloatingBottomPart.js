import { random, lerp, clamp } from "./Util";
import * as Config from "./Config";

export default class FloatingBottomPart {
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
        this.velocity += Config.BOTTOM_PART_GRAVITY_SCALE * dt;
        this.angularVelocity += Config.BOTTOM_PART_ROTATION_SCALE * dt;
        if (this.angularVelocity > Config.BOTTOM_PART_MAX_ROTATION_SPEED)
            this.angularVelocity = Config.BOTTOM_PART_MAX_ROTATION_SPEED;
            

        this.sprite.y += Config.BOTTOM_PART_GRAVITY_SCALE * this.velocity;
        this.sprite.rotation += this.angularVelocity * dt;
        this.sprite.scale.set(this.sprite.scale.x - Config.BOTTOM_PART_SCALE_DECREASE_SCALE * dt);

        if (this.sprite.scale.x < 0) {
            app.ticker.remove(this.tickFn);
            this.sprite.destroy();
        }
    }
}
