import * as Config from "./Config";
import * as Text from "./ScreenText";
import Rocket from "./Rocket";

var rockets;
var aliveRocketsCount;

export default app = new PIXI.Application({
    width: Config.SCREEN_WIDTH,
    height: Config.SCREEN_HEIGHT,
});


// Since the rockets have vastly different fuel capacities
// and the problem requires that they all burn 1 ton every second
// they will finish in vastly different times.
// Without a time scale option, the starship will take like 5 minutes to deplete its fuel
export var timeScale = 20.0;
window['increaseTimeScale'] = function() {
    timeScale *= 1.5;
    Text.write(`Time scale: ${Math.floor(timeScale)}:1`, {
        location: 'left',
        group: 1,
    });
}

// launchRockets writes the 3, 2, 1, Go! text on the screen and calls the launch method on all the rockets
function launchRockets(afterSeconds) {
    Text.write(afterSeconds == 0 ? "Launch!" : afterSeconds);

    aliveRocketsCount = rockets.length;

    if (afterSeconds == 0) {
        for (const rocket of rockets) {
            rocket.launch();

            // Show 'Success' once all rockets have launched
            rocket.onDestroy(() => {
                aliveRocketsCount -= 1;

                if (aliveRocketsCount == 0)
                    setTimeout(() => Text.write('Success!'), 1000);
            });

        }
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
