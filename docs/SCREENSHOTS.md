# Screenshots

All screenshots come from the demo vault in `docs/Aether Works Demo`, never from a real vault.

## One-off setup

1. Deploy the theme into the demo vault: `AETHER_WORKS_VAULT="$PWD/docs/Aether Works Demo" npm run deploy`.
2. Open the demo vault in Obsidian in its own window, and enable the Obsidian CLI.

## Desktop

```sh
scripts/screenshots.sh dark  /tmp/aw-shots          # 1440 x 900
scripts/screenshots.sh light /tmp/aw-shots
scripts/screenshots.sh dark  /tmp/aw-shots 900 800  # a narrow window
```

macOS stops repainting an Obsidian window that is hidden behind other windows, and the CLI then returns the last frame it painted. The script raises the demo window before each shot, so Obsidian comes to the front while it runs.

## Phone and tablet

Never use `obsidian dev:mobile`: it reloads windows and can upset plugins in other vaults. Run mobile emulation inside the demo vault's own window instead:

```sh
obsidian vault="Aether Works Demo" eval code='app.emulateMobile(true);1'     # reloads the demo window
obsidian vault="Aether Works Demo" dev:cdp method=Emulation.setDeviceMetricsOverride \
  params='{"width":390,"height":844,"deviceScaleFactor":2,"mobile":true}'
obsidian vault="Aether Works Demo" dev:screenshot path=/tmp/aw-shots/phone.png
obsidian vault="Aether Works Demo" eval code='app.emulateMobile(false);1'
```

The capture is the emulated 390 × 844 phone screen.

## Directory thumbnail

`screenshot.png` is the 1440 × 810 top of `docs/images/01-editor-dark.png`, scaled to 512 × 288:

```sh
sips -c 810 1440 --cropOffset 0 0 docs/images/01-editor-dark.png --out /tmp/shot.png
sips -z 288 512 /tmp/shot.png --out screenshot.png
```
