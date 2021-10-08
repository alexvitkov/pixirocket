# Rockets

This repo is my solution to the rockets problem.

You need to spin up up a static http server, otherwise pixi won't load the textures.

The code is split into ES6 modules and uses the esbuild bundler. 
TODO the `bundle.js` will be included in the final repo so you don't have to bother rebuilding it.


## Rebuilding bundle.js
```bash
$ npm install # need to run once
$ npm run bundle
```

# The problem
Recreate all rockets from the SpaceX API and visualize them on a canvas stage. At first, all rockets should be at the bottom of the stage and should launch at the same time and should move towards the top of the stage. All rockets have a certain amount of fuel (first_stage, second_stage).

Requirements:
- Data from SpaceX API (See "Resources" below) must be obtained dynamically (not hardcoded)
- 1 tone of fuel per second is consumed by each rocket
- When all the fuel is depleted the rocket disappears
- When all rockets have depleted their fuel a "Success" text message shows on the stage
- Code structure is Object Oriented
- The project uses the provided project assets

Bonus points:
- Code uses ES6 features
- Implement rocket stages. When the fuel in first_stage is wasted the rocket should lose it's bottom half and continue on the second_stage fuel supply
- The rocket should have exhaust flames shooting from the bottom while it moves
- Rocket exhaust flames should be "pulsating" (mimicing real flames)
- Implements the usage of promises
- Implements the usage of events
- Rockets visualize the ammount of fuel left

Resources: 
- SpaceX API: https://api.spacexdata.com/v2/rockets
- Attached assets
