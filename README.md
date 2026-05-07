# offstyles-web

Web frontend for offstyles.net — bunnyhop times, records, and an in-browser
replay viewer for Counter-Strike: Source.

## Project setup

```sh
npm install
npm run dev          # local dev server
npm run build        # type-check + production build
npm run lint         # eslint --fix
```

Recommended editor setup: VSCode + Volar.

## Replay viewer

The in-browser replay viewer renders Counter-Strike: Source maps using a vendored copy of [noclip.website](https://github.com/magcius/noclip.website)'s Source engine renderer. The viewer parses the BSP fully in-browser and streams CS:S assets (materials, models, props) on demand through the `/api/csspak` endpoint. WASM is still used to bz2-decompress the map download and parse replay files.

The integration lives under `src/replay-viewer/noclip/` (vendored) plusthe adapter at `src/replay-viewer/noclipRenderer.ts`.

## Credits

This project vendors and modifies portions of **[noclip.website](https://github.com/magcius/noclip.website)** and is licensed under the MIT License — the full notice ships with the vendored copy at `src/replay-viewer/noclip/LICENSE`. Patches against upstream are marked with a `Vendored:` comment in the source.

Other notable third-party libraries:

- [gl-matrix](https://github.com/toji/gl-matrix) — matrix/vector math.
- [pako](https://github.com/nodeca/pako) — deflate, used by the vendored
  ZIP/BSP-pakfile parser.
- [crc-32](https://github.com/SheetJS/js-crc32) — CRC32 hashing for ZIP.
- [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/) +
  [Tailwind CSS](https://tailwindcss.com/) — UI stack.
