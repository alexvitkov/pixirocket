console.log(PIXI)

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const app = new PIXI.Application({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
});
document.body.appendChild(app.view);


// Load the background
const background = PIXI.Sprite.from("assets/bg.jpg");
background.width = CANVAS_WIDTH;
background.height = CANVAS_HEIGHT;
app.stage.addChild(background);


async function loadRockets() {
    const resp = await fetch("https://api.spacexdata.com/v2/rockets");
    const data = await resp.json();

    console.log(data);
}

loadRockets();


// const rocketTexture = PIXI.Texture.from("assets/rocket.png");
// const rocketSprite = new PIXI.Sprite(rocketTexture);
