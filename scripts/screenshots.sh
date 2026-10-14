#!/bin/zsh
# Captures the theme from the demo vault (docs/Aether Works Demo). Needs a running Obsidian
# with the CLI enabled and the demo vault open in its own window. It only touches the demo
# vault. Deploy first: AETHER_WORKS_VAULT="$PWD/docs/Aether Works Demo" npm run deploy
#
# Notes always open in the main editor pane, never in whichever sidebar happens to be active.
#
# usage: scripts/screenshots.sh <dark|light> <output-folder> [width] [height]
M=$1; O=$2; W=${3:-1440}; H=${4:-900}; V="Aether Works Demo"
# Each CLI call is backgrounded and given a fixed wait, so one stalled call cannot hang the run.
ev(){ (obsidian vault="$V" eval code="$1" > /dev/null 2>&1 &); sleep ${2:-2}; }
# macOS stops repainting a window hidden behind others, and the CLI then returns its last
# frame, so the demo window is raised before every shot.
raise(){ osascript -e 'tell application "Obsidian" to activate' -e "tell application \"System Events\" to tell process \"Obsidian\" to perform action \"AXRaise\" of (first window whose name contains \"$V\")" > /dev/null 2>&1; sleep 1; }
shot(){ raise; (obsidian vault="$V" dev:screenshot path="$O/$1" > /dev/null 2>&1 &); sleep 5; }
mkdir -p "$O"
(obsidian vault="$V" dev:cdp method=Emulation.setDeviceMetricsOverride params="{\"width\":$W,\"height\":$H,\"deviceScaleFactor\":1,\"mobile\":false}" > /dev/null 2>&1 &); sleep 2
# Obsidian reads theme CSS once, so switch away and back to pick up a fresh deploy.
ev 'app.vault.setConfig("nativeMenus",false);app.vault.setConfig("settingsPopoutWindow",false);app.customCss.setTheme("");setTimeout(()=>app.customCss.setTheme("Aether Works"),300);"ok"' 2
if [ "$M" = dark ]; then ev 'app.vault.setConfig("theme","obsidian");"dark"' 1; else ev 'app.vault.setConfig("theme","moonstone");"light"' 1; fi
ev '(async()=>{const f=app.vault.getAbstractFileByPath("Difference Engine Mk II.md");const l=app.workspace.getMostRecentLeaf(app.workspace.rootSplit);await l.setViewState({type:"markdown",state:{file:f.path,mode:"source",source:false}});app.workspace.setActiveLeaf(l,{focus:false});document.activeElement?.blur();setTimeout(()=>l.view.currentMode.applyScroll(0),300);return 1})()' 3
shot "01-editor-$M-${W}.png"
ev '(async()=>{const l=app.workspace.getMostRecentLeaf(app.workspace.rootSplit);await l.setViewState({type:"markdown",state:{file:"Difference Engine Mk II.md",mode:"preview"}});setTimeout(()=>l.view.currentMode.applyScroll(0),300);return 1})()' 3
shot "02-reading-$M-${W}.png"
ev '(async()=>{const l=app.workspace.getMostRecentLeaf(app.workspace.rootSplit);const n=l.view.data.split("\n").findIndex(s=>s.startsWith("```python"));l.view.currentMode.applyScroll(n);return n})()' 2
shot "03-reading-lower-$M-${W}.png"
ev '(()=>{const s=app.setting;s.open();s.openTabById("appearance");document.body.appendChild(s.containerEl);return 1})()' 3
shot "04-settings-$M-${W}.png"
ev 'app.setting.close();app.commands.executeCommandById("command-palette:open");1' 2
shot "05-palette-$M-${W}.png"
ev 'document.querySelector(".modal-container .modal-bg")?.click();(async()=>{const l=app.workspace.getMostRecentLeaf(app.workspace.rootSplit);await l.setViewState({type:"markdown",state:{file:"Difference Engine Mk II.md",mode:"source",source:false}})})();1' 2
