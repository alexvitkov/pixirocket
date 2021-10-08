import App from "./App";
import * as Config from "./Config";


const groups = [];


class Text {
    constructor(label, animatePosition) {
        this.scaleAdd = 0;
        this.yAdd = Config.ScreenText.INITIAL_Y_SPEED;
        this.text = label;
        this.isAlive = true;
        this.animatePosition = animatePosition;

        this.tickerFn = this.tick.bind(this);
        App.ticker.add(this.tickerFn);

    }

    destroy() {
        this.text.destroy();
        this.isAlive = false;
        App.ticker.remove(this.tickerFn);
    }

    tick() {
        const dt = App.ticker.deltaTime;
        this.scaleAdd -= 0.0001 * dt;

        if (this.animatePosition) {
            const scale = this.text.scale.x + this.scaleAdd * dt;
            this.text.scale.set(scale);

            this.yAdd += Config.ScreenText.Y_SPEED_CHANGE * dt;
            if (this.yAdd < 0)
                this.yAdd = 0;
            this.text.y -= this.yAdd * dt;
        }

        this.text.alpha -= Config.ScreenText.ALPHA_DECREASE * dt;
        if (this.text.alpha <= 0)
            this.destroy();
    }
}

export function write(text, options) {
    let label = new PIXI.Text(text, {
        fontFamily: 'Arial',
        fontSize: 40,
        fill: 'yellow',
        stroke: 'black',
        align: 'center',
        strokeThickness: 5,
    });

    label.zIndex = 1000;

    if (options && options.location === 'left') {
        label.x = 0;
        label.y = Config.SCREEN_HEIGHT;
        label.anchor.set(0, 1);
    }
    else {
        label.x = Config.SCREEN_WIDTH / 2;
        label.y = Config.SCREEN_HEIGHT / 2;
        label.anchor.set(.5);
    }

    const textObj = new Text(label, !(options && options.location === 'left'));

    if (options && options.group !== undefined) {
        if (groups[options.group] && groups[options.group].isAlive) {
            groups[options.group].destroy();
        }
        groups[options.group] = textObj;
    }


    App.stage.addChild(label);
}
