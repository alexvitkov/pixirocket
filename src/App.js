import * as Config from "./Config";
import * as Text from "./ScreenText";
import Rocket from "./Rocket";

export default app = new PIXI.Application({
    width: Config.CANVAS_WIDTH,
    height: Config.CANVAS_HEIGHT,
});

document.body.appendChild(app.view);
app.stage.sortableChildren = true;

// Load the background
const background = PIXI.Sprite.from("assets/bg.jpg");
background.width = Config.CANVAS_WIDTH;
background.height = Config.CANVAS_HEIGHT;
app.stage.addChild(background);

var rockets;

// Load the rockets from the SpaceX API
async function loadRockets() {
    const resp = await fetch("https://api.spacexdata.com/v2/rockets");
    const rocketsData = await resp.json();

    let xAdd = Config.CANVAS_WIDTH / (rocketsData.length + 1);
    let x = xAdd;

    rockets = rocketsData.map((rocketData) => {
        const rocket = new Rocket(x, rocketData);
        x += xAdd;
        return rocket;
    });
}


function launch(afterSeconds) {
    Text.write(afterSeconds == 0 ? "Launch!" : afterSeconds);

    if (afterSeconds == 0) {
        for (const rocket of rockets)
            rocket.launch();
    }
    else {
        setTimeout(() => launch(afterSeconds - 1), 1000);
    }
}


loadRockets();

launch(3);
