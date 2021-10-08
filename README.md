# Rockets

You need to spin up up a static http server, otherwise pixi can't load the textures.

Or you can just run it from https://alexvitkov.github.io/pixirocket


## Time Scale Problem
It's required that all rockets burn fuel at a rate of 1 tone/s, 
but the Starship has 3300 tons, so in order for the animation not to take an hour,
I'm using 20:1 time scaling, which can further be increased by a button.


## Rebuilding bundle.js
The code is split into ES6 modules and uses the esbuild bundler. To build the bundle, do

```bash
$ npm install # need to run once to install esbuild
$ npm run bundle
```

