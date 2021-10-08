import App from "./App";
import * as Config from "./Config";


function animateText(text) {

    let scaleAdd = 0;
    let yAdd = 1.5;

    const tickerFn = () => {
        const dt = App.ticker.deltaTime;
        scaleAdd -= 0.0001 * dt;

        const scale = text.scale.x + scaleAdd * dt;
        text.scale.set(scale);

        yAdd -= 0.015 * dt;
        if (yAdd < 0)
            yAdd = 0;
        text.y -= yAdd * dt;

        text.alpha -= 0.007 * dt;
        if (text.alpha <= 0) {
            App.ticker.remove(tickerFn);
            text.destroy();
        }

        //if (scale <= 0) {
        //}
    }

    App.ticker.add(tickerFn);


}

export function write(text) {
    let label = new PIXI.Text(text, {
        fontFamily: 'Arial',
        fontSize: 40,
        fill: 'yellow',
        stroke: 'black',
        strokeThickness: 5,
    });
    label.anchor.set(.5);
    label.x = Config.SCREEN_WIDTH / 2;
    label.y = Config.SCREEN_HEIGHT / 2;
    label.zIndex = 1000;
    App.stage.addChild(label);
    animateText(label);
}
