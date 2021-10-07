console.log(PIXI)

const app = new PIXI.Application({
    width: 800,
    height: 600,
    resizeTo: window,
});
document.body.appendChild(app.view);


// Load the background
const background = PIXI.Sprite.from("assets/bg.jpg");
app.stage.addChild(background);

function onResize(newWidth, newHeight) {
    background.width = newWidth;
    background.height = newHeight;
}
app.renderer.resize = onResize;
onResize(app.view.width, app.view.height);

init();

// const rocketTexture = PIXI.Texture.from("assets/rocket.png");
// const rocketSprite = new PIXI.Sprite(rocketTexture);
