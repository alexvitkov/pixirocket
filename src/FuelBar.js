
export default class FuelBar {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.container = new PIXI.Container();
        this.container.y = -height;

        this.fuelBar = new PIXI.Graphics();
        this.container.addChild(this.fuelBar);

        this.update(1.0);
    }

    update(percentage) {
        this.fuelBar.clear();

        this.fuelBar.beginFill(0x000000);
        this.fuelBar.lineStyle(2, 0xFF0000);
        this.fuelBar.drawRect(0, 0, this.width, this.height);

        this.fuelBar.beginFill(0xFFFF00);
        this.fuelBar.lineStyle(2, 0xFF0000);
        this.fuelBar.drawRect(0, (1.0 - percentage) * this.height, this.width, percentage * this.height);
    }
}
