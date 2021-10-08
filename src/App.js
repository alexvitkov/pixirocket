import * as Config from "./Config";
import * as Text from "./ScreenText";
import Rocket from "./Rocket";



export default app = new PIXI.Application({
    width: Config.SCREEN_WIDTH,
    height: Config.SCREEN_HEIGHT,
});





var rockets; // A list of the active Rockets


// launchRockets writes the 3, 2, 1, Go! text on the screen
// and calls the launch method on all the rockets
function launchRockets(afterSeconds) {
    Text.write(afterSeconds == 0 ? "Launch!" : afterSeconds);

    if (afterSeconds == 0) {
        for (const rocket of rockets)
            rocket.launch();
    }
    else {
        setTimeout(() => launchRockets(afterSeconds - 1), 1000);
    }
}

async function start() {
    // Add the PixiJS canvas to the document
    document.body.appendChild(app.view);

    // Elements need to be sortable to make sure ScreenText is always on top
    app.stage.sortableChildren = true;

    // Load the background
    const background = PIXI.Sprite.from("assets/bg.jpg");
    background.width = Config.SCREEN_WIDTH;
    background.height = Config.SCREEN_HEIGHT;
    app.stage.addChild(background);


    // Load the rocket data from the SpaceX API
    const resp = await fetch("https://api.spacexdata.com/v2/rockets");
    const data = await resp.json();

    // distBetweenRockets is the pixel distance between two rockets.
    // We divide by data.length + 1 so we have some space between the first/last rocket and the screen edges
    let distBetweenRockets = Config.SCREEN_WIDTH / (data.length + 1);

    let x = 0;
    rockets = data.map(rocketData => new Rocket(x += distBetweenRockets, rocketData));

    launchRockets(3);
}

start();
