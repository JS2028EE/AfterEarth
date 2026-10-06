# AfterEarth

A browser-based 3D sci-fi survival exploration game built for Replit.

Wake alone in an abandoned Earth launch facility, recover a futuristic spacecraft, uncover the disappearance of humanity, and explore dangerous worlds.

## Run
```bash
npm install
npm run dev
```

Controls: WASD move, Shift sprint, E interact, I inventory, M map, V camera, mouse look.

## Current status and maintenance

AfterEarth is an early playable prototype, as described in [TESTING.md](TESTING.md). Cinematic story, combat, polished collision, and later worlds remain in development.

Save/load now restores inventory, position, survival and ship state, and completed quests. Loading an Earth save after visiting Verdantia restores the Earth scene; repeated Verdantia loads reuse its environment instead of adding duplicate meshes. Earth-only obstacles no longer block movement on Verdantia. F5 is intercepted so saving does not reload the page, and I opens the backpack.

Local saves are browser-specific. Existing older saves remain readable when fields are absent. Run `npm run build` for a production build; follow the playtest checklist to verify movement, launch, inventory, and save/load in the browser.

The build tool is pinned to Vite 7.3.7. Use Node.js 20.19+ (22.12+ on the Node 22 line) or a newer supported LTS. Lockfiles are committed; use `npm ci` for reproducible installs.
