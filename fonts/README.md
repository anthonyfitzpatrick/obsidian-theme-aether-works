# Embedded typefaces

Aether Works embeds the Latin subset of five typefaces in `theme.css`, so it looks right
offline and loads nothing from the network. Each `.woff2` file here is the unmodified file
Google Fonts serves for that subset. `scripts/build.ts` inlines them under the family names
"Aether Rye", "Aether Playfair" and so on, so they never clash with copies you have installed.

| Family | Designer | Used for | Licence |
| --- | --- | --- | --- |
| Rye | Nicole Fally, Sorkin Type Co | The title bar lettering | SIL Open Font License 1.1 |
| Playfair Display | Claus Eggers Sørensen | Note titles, headings, tabs | SIL Open Font License 1.1 |
| IM Fell English | Igino Marini | Body text and the interface | SIL Open Font License 1.1 |
| Cinzel | Natanael Gama | Engraved plates, small capitals, buttons, table heads | SIL Open Font License 1.1 |
| Cutive Mono | Vernon Adams | Code, tags, properties, the status bar. A typewriter face drawn from the Smith Premier, first made in 1889, so it belongs to the same decade as the rest of the theme | SIL Open Font License 1.1 |

All five are under the SIL Open Font License; the full text, with each family's copyright
line, is in [OFL.txt](OFL.txt). The fonts are licensed under it, not under the theme's MIT
licence.

The "Aether Works - Use Obsidian's fonts" CSS snippet turns all five off; no plugin needed.
