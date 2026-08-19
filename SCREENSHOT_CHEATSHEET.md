# Screenshot Cheatsheet

Generated from the current `TUTORIALS` and `CAPTURED` data in `index.html`. Run `node tools/generate-screenshot-cheatsheet.mjs` after guide changes.

## Current inventory

- Ready guides: 88
- Referenced visual checkpoints: 143
- Unique screenshot files: 255
- Desktop files: 118
- App files: 112
- Single-version files: 25
- Entries marked captured in the manifest: 4

The current app now matches the consolidated **143-checkpoint** selection. Those checkpoints resolve to **255 unique filenames** in the current code. The older handoff's 253-file prose count is two lower than the filenames produced by its own consolidated mapping; this sheet uses the actual mapping.

## How to use the CSV

1. Filter **Priority** to `Capture`.
2. Work by **Provider**, then **Guide title**, then **Step**.
3. Save the image using **Filename** exactly under the app's `img/` folder.
4. Check **Reused by** before recapturing a screen shared by more than one step.
5. After adding files, update the `CAPTURED` manifest in `index.html` with the capture date and regenerate this sheet.

The repository currently does not include the screenshot image assets themselves. A manifest date means the app records that a capture happened; it does not prove the corresponding file is present in this repository.
