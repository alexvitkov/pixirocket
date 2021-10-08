import * as Config from "./Config";
import Rocket from "./Rocket";

export default app = new PIXI.Application({
    width: Config.CANVAS_WIDTH,
    height: Config.CANVAS_HEIGHT,
});

document.body.appendChild(app.view);

// Load the background
const background = PIXI.Sprite.from("assets/bg.jpg");
background.width = Config.CANVAS_WIDTH;
background.height = Config.CANVAS_HEIGHT;
app.stage.addChild(background);


// Load the rockets from the SpaceX API
async function loadRockets() {
    const resp = await fetch("https://api.spacexdata.com/v2/rockets");
    const rocketsData = await resp.json();

    let xAdd = Config.CANVAS_WIDTH / (rocketsData.length + 1);
    let x = xAdd;

    for (const rocketData of rocketsData) {
        new Rocket(x, rocketData);
        x += xAdd;
    }
}

loadRockets();
