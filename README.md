# NubiBuilds Dark

A dark colour theme for Visual Studio Code with a green-phosphor terminal look:
a green-tinted dark background, one green accent, and four supporting colours
that each have a fixed job.

The extension contains three dark themes that share one palette and differ only
in how backgrounds are layered:

| Theme | Backgrounds |
| --- | --- |
| **NubiBuilds Dark** | The editor is darkest; the side bar, panel and terminal are one step lighter; the bars are a third shade. |
| **NubiBuilds Dark Void** | Everything uses the darkest background, like a terminal screen. Areas are separated by lines only. |
| **NubiBuilds Dark Float** | The editor is raised to the side bar's shade. Selection, search and diff highlights are slightly weaker so that comments stay readable on the current line. |

There is no light theme and no High Contrast theme.

## Palette

| Role | Colour | Used for |
| --- | --- | --- |
| Background | `#0a0e0b` | Editor |
| Surface | `#0f1511` | Side bar, panel, terminal, floating widgets |
| Bar | `#111813` | Activity bar, title bar, status bar, tab strip |
| Text | `#cfdad2` | Default text and variables |
| Dim | `#8a9d8f` | Comments, punctuation, secondary text |
| Accent green | `#62f08f` | Focus, cursor, active indicators, strings, success, added |
| Amber | `#f0b45a` | Types, warnings, search matches, modified |
| Cyan | `#7fd4ff` | Functions, links, information, renamed |
| Coral | `#ff8a7a` | Errors, deleted, HTML tags |
| Violet | `#b9a6ff` | Keywords, merge conflicts |
| Orange | `#f79e6c` | Numbers, booleans, constants, enum members |
| Mint | `#a8e0bd` | Object properties, CSS property names, JSON/YAML keys |
| Teal | `#71e2c7` | Regular expressions, escapes, namespaces |

Colour is never the only signal. Comments, parameters, decorators and built-in
symbols are italic; deprecated symbols are struck through; active tabs and
panels carry an accent line; errors and warnings come with icons and squiggles.

## Install

From a packaged file:

```sh
code --install-extension nubibuilds-dark-0.1.0.vsix
```

Then open the Command Palette, run **Preferences: Color Theme** and choose
**NubiBuilds Dark**, **NubiBuilds Dark Void** or **NubiBuilds Dark Float**. Or set it in `settings.json`:

```jsonc
{
  "workbench.colorTheme": "NubiBuilds Dark"
}
```

## Recommended settings

```jsonc
{
  // On by default; the theme provides semantic token colours.
  "editor.semanticHighlighting.enabled": true,
  // Six bracket colours taken from the palette.
  "editor.bracketPairColorization.enabled": true,
  // Draws an amber line on tabs with unsaved changes.
  "workbench.editor.highlightModifiedTabs": true
}
```

## Development

All colours are defined once, in `scripts/build-theme.mjs`. The three theme
files in `themes/` are generated from it; do not edit them by hand. Each
command below runs for all three themes. To work on one, set `NUBI_VARIANT` to
`dark`, `void` or `float`.

```sh
npm run build     # regenerate the three files in themes/
npm run check     # contrast and coverage checks; non-zero exit on failure
npm run package   # build, check, then create the .vsix
```

No dependencies are installed. Packaging downloads `@vscode/vsce` through `npx`.

To try the theme without installing it, open this folder in VS Code and press
`F5` (**Run Extension**). An Extension Development Host opens on the `samples/`
folder, which has one realistic file per supported language.

- `scripts/check-contrast.mjs` computes WCAG contrast for text on every surface,
  for syntax colours on top of the transparent layers (selection, search
  matches, diff lines, the debug execution line), for non-text indicators and
  for text on coloured backgrounds. It also checks that the main syntax
  categories are far enough apart (CIE76 ΔE of at least 12).
- `scripts/check-coverage.mjs` checks that every colour ID in the theme exists
  in the official Theme Color Reference (`scripts/official-color-ids.json` is a
  snapshot of that page), that the required IDs, token scopes and semantic
  tokens are present, and that every colour value comes from the palette.

## Known limitations

- **No High Contrast variant.** The theme does not set `contrastBorder` or
  `contrastActiveBorder`, so VS Code's own High Contrast themes are unaffected.
- **Webviews and extension UI** are only partly themed. Extensions that draw
  their own interface receive the theme's colours as CSS variables but decide
  for themselves how to use them.
- **Conditional breakpoints and logpoints** share the breakpoint colour. VS Code
  has no separate colour IDs for them; they differ by icon shape.
- **The diff editor has no "changed line" colour.** A change is shown as a
  removed line plus an inserted line. Amber marks modified lines in the gutter.
- **The Secondary Side Bar** has no colour IDs of its own and uses the Side Bar
  colours.
- The integrated terminal may adjust text colours on its own when
  `terminal.integrated.minimumContrastRatio` is above 1 (the default is 4.5).
