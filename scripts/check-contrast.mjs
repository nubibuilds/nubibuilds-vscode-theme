// Contrast checks for NubiBuilds Dark.
// Reads the *built* theme JSON so the artefact itself is what gets verified.
// Exits non-zero when any requirement fails.

import { readFileSync } from 'node:fs';
import { palette as p, THEME_PATH } from './build-theme.mjs';

const theme = JSON.parse(readFileSync(THEME_PATH, 'utf8'));
const C = theme.colors;

// ---------------------------------------------------------------------------
// Colour maths
// ---------------------------------------------------------------------------

function parse(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  };
}

const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** Composite `layers` (bottom to top, may have alpha) onto an opaque base. */
function composite(base, ...layers) {
  let out = parse(base);
  for (const layer of layers) {
    const l = parse(layer);
    out = {
      r: out.r + (l.r - out.r) * l.a,
      g: out.g + (l.g - out.g) * l.a,
      b: out.b + (l.b - out.b) * l.a,
      a: 1,
    };
  }
  return toHex(out);
}

const linear = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

function luminance(hex) {
  const { r, g, b } = parse(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function lab(hex) {
  const { r, g, b } = parse(hex);
  const [R, G, B] = [linear(r), linear(g), linear(b)];
  const X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  const Y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const Z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883;
  const f = (v) => (v > 216 / 24389 ? Math.cbrt(v) : ((24389 / 27) * v + 16) / 116);
  const [fx, fy, fz] = [f(X), f(Y), f(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(a, b) {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

// ---------------------------------------------------------------------------
// Bookkeeping
// ---------------------------------------------------------------------------

const results = []; // { group, label, value, min, pass }
const notes = [];

function check(group, label, value, min) {
  results.push({ group, label, value, min, pass: value >= min });
}

function id(name) {
  if (!(name in C)) throw new Error(`check-contrast: colour ID "${name}" is not in the theme`);
  return C[name];
}

/** Resolve a background spec: a hex, a colour ID, or [base, ...layers] of either. */
function bgOf(spec) {
  const one = (s) => (s.startsWith('#') ? s : id(s));
  if (Array.isArray(spec)) return composite(...spec.map(one));
  return one(spec);
}

const nameOf = (hex) => Object.entries(p).find(([, v]) => v === hex)?.[0] ?? hex;

// ---------------------------------------------------------------------------
// 1. Text colours on every surface
// ---------------------------------------------------------------------------

const syntaxColours = ['fg', 'hi', 'dim', 'violet', 'cyan', 'amber', 'orange', 'accent', 'teal', 'operator', 'mint', 'coral'];
const ansiText = {
  ansiRed: p.coral,
  ansiGreen: p.accent,
  ansiYellow: p.amber,
  ansiBlue: p.blue,
  ansiMagenta: p.violet,
  ansiCyan: p.cyan,
  ansiWhite: p.fg,
  ansiBrightBlack: p.muted,
  ansiBrightRed: p.redBright,
  ansiBrightGreen: p.greenBright,
  ansiBrightYellow: p.yellowBright,
  ansiBrightBlue: p.blueBright,
  ansiBrightMagenta: p.magentaBright,
  ansiBrightCyan: p.cyanBright,
  ansiBrightWhite: p.hi,
};
const surfaces = ['bg', 'surface', 'bar', 'hover', 'selectionList', 'selectionListInactive'];

for (const s of surfaces) {
  for (const c of syntaxColours) check('Text on surfaces', `${c} on ${s}`, contrast(p[c], p[s]), 4.5);
  for (const [slot, hex] of Object.entries(ansiText)) {
    // Bright black (= muted) is never drawn on a selected list row by the theme;
    // on that one surface it is held to the 3:1 exception instead.
    const exception = hex === p.muted && s === 'selectionList';
    check('Text on surfaces', `${slot} on ${s}`, contrast(hex, p[s]), exception ? 3 : 4.5);
  }
}
notes.push(
  `muted / ANSI bright black on selectionList: ${contrast(p.muted, p.selectionList).toFixed(2)}:1 ` +
    `(exception: disabled text on a selected row, held to >= 3:1)`,
);

// Allowed exceptions
for (const s of ['bg', 'surface', 'bar', 'hover']) {
  check('Exception: faint >= 3:1', `faint on ${s}`, contrast(p.faint, p[s]), 3);
}
notes.push(
  `faint (line numbers, whitespace, ignored files) is held to >= 3:1 only: ` +
    ['bg', 'surface', 'bar', 'hover'].map((s) => `${s} ${contrast(p.faint, p[s]).toFixed(2)}`).join(', '),
);
notes.push(
  `line is a decorative separator with no contrast requirement: ` +
    ['bg', 'surface', 'bar'].map((s) => `${s} ${contrast(p.line, p[s]).toFixed(2)}`).join(', '),
);
notes.push(
  `ANSI black (${p.line}) is exempt: it is meant as a background colour ` +
    `(${contrast(p.line, id('terminal.background')).toFixed(2)}:1 on the terminal background)`,
);

// ---------------------------------------------------------------------------
// 2. Syntax colours on top of transparent layers
// ---------------------------------------------------------------------------

const overlays = [
  ['selection', ['editor.selectionBackground']],
  ['inactive selection', ['editor.inactiveSelectionBackground']],
  ['selection highlight', ['editor.selectionHighlightBackground']],
  ['word highlight', ['editor.wordHighlightBackground']],
  ['word highlight (write)', ['editor.wordHighlightStrongBackground']],
  ['word highlight (text)', ['editor.wordHighlightTextBackground']],
  ['find match (other)', ['editor.findMatchHighlightBackground']],
  ['find match (active)', ['editor.findMatchBackground']],
  ['find range', ['editor.findRangeHighlightBackground']],
  ['hover highlight', ['editor.hoverHighlightBackground']],
  ['range highlight', ['editor.rangeHighlightBackground']],
  ['symbol highlight', ['editor.symbolHighlightBackground']],
  ['bracket match', ['editorBracketMatch.background']],
  ['linked editing', ['editor.linkedEditingBackground']],
  ['snippet tabstop', ['editor.snippetTabstopHighlightBackground']],
  ['folded region', ['editor.foldBackground']],
  ['diff inserted line', ['diffEditor.insertedLineBackground']],
  ['diff inserted line + word', ['diffEditor.insertedLineBackground', 'diffEditor.insertedTextBackground']],
  ['diff removed line', ['diffEditor.removedLineBackground']],
  ['diff removed line + word', ['diffEditor.removedLineBackground', 'diffEditor.removedTextBackground']],
  ['debug execution line', ['editor.stackFrameHighlightBackground']],
  ['debug focused stack frame', ['editor.focusedStackFrameHighlightBackground']],
  ['merge current', ['merge.currentContentBackground']],
  ['merge incoming', ['merge.incomingContentBackground']],
  ['merge common', ['merge.commonContentBackground']],
  ['merge editor change + word', ['mergeEditor.change.background', 'mergeEditor.change.word.background']],
  ['merge editor base change + word', ['mergeEditor.changeBase.background', 'mergeEditor.changeBase.word.background']],
  ['merge editor conflicting lines', ['mergeEditor.conflictingLines.background']],
  ['merge editor input 1', ['mergeEditor.conflict.input1.background']],
  ['merge editor input 2', ['mergeEditor.conflict.input2.background']],
  ['test coverage (covered)', ['testing.coveredBackground']],
  ['test coverage (uncovered)', ['testing.uncoveredBackground']],
  ['test coverage (uncovered branch)', ['testing.uncoveredBranchBackground']],
  ['test error line', ['testing.message.error.lineBackground']],
  ['comment range (active)', ['editorCommentsWidget.rangeActiveBackground']],
];

// Code is drawn on the editor background and on the current-line highlight.
const codeBases = [
  ['bg', id('editor.background')],
  ['current line', id('editor.lineHighlightBackground')],
];

for (const [label, layers] of overlays) {
  for (const [baseName, base] of codeBases) {
    const under = composite(base, ...layers.map(id));
    for (const c of syntaxColours) {
      check('Syntax on overlays', `${c} on ${label} (${baseName})`, contrast(p[c], under), 4.5);
    }
  }
}

// Terminal selection: ANSI text (bright black is the documented exception).
{
  const under = composite(id('terminal.background'), id('terminal.selectionBackground'));
  for (const [slot, hex] of Object.entries(ansiText)) {
    if (hex === p.muted) {
      notes.push(`ANSI bright black on terminal selection: ${contrast(hex, under).toFixed(2)}:1 (exception, held to >= 3:1)`);
      check('Exception: faint >= 3:1', `${slot} on terminal selection`, contrast(hex, under), 3);
    } else {
      check('Syntax on overlays', `${slot} on terminal selection`, contrast(hex, under), 4.5);
    }
  }
}

// Informational: layers that can stack when the cursor word is also selected.
{
  const stacked = composite(
    id('editor.lineHighlightBackground'),
    id('editor.wordHighlightBackground'),
    id('editor.selectionBackground'),
  );
  notes.push(
    `stacked word highlight + selection on the current line (not enforced): ` +
      `dim ${contrast(p.dim, stacked).toFixed(2)}:1, fg ${contrast(p.fg, stacked).toFixed(2)}:1`,
  );
}

// ---------------------------------------------------------------------------
// 3. Non-text components (>= 3:1)
// ---------------------------------------------------------------------------

const nonText = [
  ['focusBorder', 'editor.background'],
  ['focusBorder', 'sideBar.background'],
  ['focusBorder', 'statusBar.background'],
  ['focusBorder', p.hover],
  ['focusBorder', 'list.activeSelectionBackground'],
  ['list.focusOutline', 'list.activeSelectionBackground'],
  ['input.border', 'input.background'],
  ['input.border', 'sideBar.background'],
  ['dropdown.border', 'dropdown.background'],
  ['checkbox.border', 'checkbox.background'],
  ['button.secondaryBorder', 'button.secondaryBackground'],
  ['button.secondaryBorder', 'sideBar.background'],
  ['keybindingLabel.border', 'keybindingLabel.background'],
  ['editorCursor.foreground', 'editor.background'],
  ['editorCursor.foreground', 'editor.lineHighlightBackground'],
  ['editorCursor.foreground', ['editor.lineHighlightBackground', 'editor.selectionBackground']],
  ['terminalCursor.foreground', 'terminal.background'],
  ['tab.activeBorderTop', 'tab.activeBackground'],
  ['tab.activeBorderTop', 'tab.inactiveBackground'],
  ['tab.activeModifiedBorder', 'tab.activeBackground'],
  ['tab.unfocusedActiveBorderTop', 'tab.unfocusedActiveBackground'],
  ['activityBar.activeBorder', 'activityBar.background'],
  ['panelTitle.activeBorder', 'panel.background'],
  ['terminal.tab.activeBorder', 'panel.background'],
  ['editorBracketMatch.border', 'editor.background'],
  ['editorIndentGuide.activeBackground1', 'editor.background'],
  ['tree.indentGuidesStroke', 'sideBar.background'],
  ['editorGutter.addedBackground', 'editor.background'],
  ['editorGutter.modifiedBackground', 'editor.background'],
  ['editorGutter.deletedBackground', 'editor.background'],
  ['editorError.foreground', 'editor.background'],
  ['editorWarning.foreground', 'editor.background'],
  ['editorInfo.foreground', 'editor.background'],
  ['editorHint.foreground', 'editor.background'],
  ['debugIcon.breakpointForeground', 'editor.background'],
  ['debugIcon.breakpointDisabledForeground', 'editor.background'],
  ['debugIcon.breakpointCurrentStackframeForeground', 'editor.background'],
  ['editorLightBulb.foreground', 'editor.background'],
  ['progressBar.background', 'editor.background'],
  ['peekView.border', 'editor.background'],
  ['inputValidation.errorBorder', 'inputValidation.errorBackground'],
  ['inputValidation.warningBorder', 'inputValidation.warningBackground'],
  ['inputValidation.infoBorder', 'inputValidation.infoBackground'],
  ['inputOption.activeBorder', ['input.background', 'inputOption.activeBackground']],
  ['testing.iconPassed', 'sideBar.background'],
  ['testing.iconFailed', 'sideBar.background'],
  ['testing.iconSkipped', 'sideBar.background'],
  ['testing.iconQueued', 'sideBar.background'],
  ['terminalCommandDecoration.defaultBackground', 'terminal.background'],
  ['terminalCommandDecoration.successBackground', 'terminal.background'],
  ['terminalCommandDecoration.errorBackground', 'terminal.background'],
];
for (let i = 1; i <= 6; i++) nonText.push([`editorBracketHighlight.foreground${i}`, 'editor.background']);

for (const [fg, bg] of nonText) {
  const label = `${fg} vs ${Array.isArray(bg) ? bg.join(' + ') : bg.startsWith('#') ? nameOf(bg) : bg}`;
  check('Non-text components', label, contrast(id(fg), bgOf(bg)), 3);
}
notes.push(
  `decorative, no requirement: inactive indent guides (${contrast(id('editorIndentGuide.background1'), p.bg).toFixed(2)}:1), ` +
    `scrollbar slider at rest (${contrast(composite(p.bg, id('scrollbarSlider.background')), p.bg).toFixed(2)}:1; ` +
    `hover ${contrast(composite(p.bg, id('scrollbarSlider.hoverBackground')), p.bg).toFixed(2)}:1)`,
);

// ---------------------------------------------------------------------------
// 4. UI text on its actual background, including coloured backgrounds
// ---------------------------------------------------------------------------

const uiPairs = [
  // coloured backgrounds
  ['button.foreground', 'button.background'],
  ['button.foreground', 'button.hoverBackground'],
  ['button.secondaryForeground', 'button.secondaryBackground'],
  ['button.secondaryForeground', 'button.secondaryHoverBackground'],
  ['badge.foreground', 'badge.background'],
  ['activityBarBadge.foreground', 'activityBarBadge.background'],
  ['activityErrorBadge.foreground', 'activityErrorBadge.background'],
  ['activityWarningBadge.foreground', 'activityWarningBadge.background'],
  ['panelTitleBadge.foreground', 'panelTitleBadge.background'],
  ['profileBadge.foreground', 'profileBadge.background'],
  ['extensionButton.foreground', 'extensionButton.background'],
  ['extensionButton.foreground', 'extensionButton.hoverBackground'],
  ['extensionButton.prominentForeground', 'extensionButton.prominentBackground'],
  ['extensionButton.prominentForeground', 'extensionButton.prominentHoverBackground'],
  ['extensionBadge.remoteForeground', 'extensionBadge.remoteBackground'],
  ['statusBar.debuggingForeground', 'statusBar.debuggingBackground'],
  ['statusBarItem.remoteForeground', 'statusBarItem.remoteBackground'],
  ['statusBarItem.remoteHoverForeground', 'statusBarItem.remoteHoverBackground'],
  ['statusBarItem.errorForeground', 'statusBarItem.errorBackground'],
  ['statusBarItem.errorHoverForeground', 'statusBarItem.errorHoverBackground'],
  ['statusBarItem.warningForeground', 'statusBarItem.warningBackground'],
  ['statusBarItem.warningHoverForeground', 'statusBarItem.warningHoverBackground'],
  ['statusBarItem.prominentForeground', 'statusBarItem.prominentBackground'],
  ['statusBarItem.prominentHoverForeground', 'statusBarItem.prominentHoverBackground'],
  ['statusBarItem.offlineForeground', 'statusBarItem.offlineBackground'],
  ['statusBarItem.offlineHoverForeground', 'statusBarItem.offlineHoverBackground'],
  ['debugView.exceptionLabelForeground', 'debugView.exceptionLabelBackground'],
  ['debugView.stateLabelForeground', 'debugView.stateLabelBackground'],
  ['testing.message.error.badgeForeground', 'testing.message.error.badgeBackground'],
  ['testing.coverCountBadgeForeground', 'testing.coverCountBadgeBackground'],
  ['inlineEdit.gutterIndicator.primaryForeground', 'inlineEdit.gutterIndicator.primaryBackground'],
  ['inlineEdit.gutterIndicator.secondaryForeground', 'inlineEdit.gutterIndicator.secondaryBackground'],
  ['banner.foreground', 'banner.background'],
  ['banner.iconForeground', 'banner.background'],
  ...[1, 2, 3, 4, 5].map((n) => ['scmGraph.historyItemHoverLabelForeground', `scmGraph.foreground${n}`]),
  ['scmGraph.historyItemHoverDefaultLabelForeground', 'scmGraph.historyItemHoverDefaultLabelBackground'],

  // workbench chrome
  ['statusBar.foreground', 'statusBar.background'],
  ['statusBar.noFolderForeground', 'statusBar.noFolderBackground'],
  ['statusBarItem.hoverForeground', 'statusBarItem.hoverBackground'],
  ['activityBar.foreground', 'activityBar.background'],
  ['activityBar.inactiveForeground', 'activityBar.background'],
  ['activityBar.foreground', 'activityBar.activeBackground'],
  ['titleBar.activeForeground', 'titleBar.activeBackground'],
  ['titleBar.inactiveForeground', 'titleBar.inactiveBackground'],
  ['commandCenter.foreground', 'commandCenter.background'],
  ['commandCenter.activeForeground', 'commandCenter.activeBackground'],
  ['commandCenter.inactiveForeground', 'commandCenter.background'],
  ['menubar.selectionForeground', 'menubar.selectionBackground'],
  ['menu.foreground', 'menu.background'],
  ['menu.selectionForeground', 'menu.selectionBackground'],
  ['sideBar.foreground', 'sideBar.background'],
  ['sideBarTitle.foreground', 'sideBarTitle.background'],
  ['sideBarSectionHeader.foreground', 'sideBarSectionHeader.background'],
  ['panelTitle.activeForeground', 'panel.background'],
  ['panelTitle.inactiveForeground', 'panel.background'],
  ['panelSectionHeader.foreground', 'panelSectionHeader.background'],
  ['breadcrumb.foreground', 'breadcrumb.background'],
  ['breadcrumb.focusForeground', 'breadcrumb.background'],
  ['breadcrumb.activeSelectionForeground', 'breadcrumb.background'],
  ['tab.activeForeground', 'tab.activeBackground'],
  ['tab.inactiveForeground', 'tab.inactiveBackground'],
  ['tab.hoverForeground', 'tab.hoverBackground'],
  ['tab.unfocusedActiveForeground', 'tab.unfocusedActiveBackground'],
  ['tab.unfocusedInactiveForeground', 'tab.unfocusedInactiveBackground'],
  ['tab.unfocusedHoverForeground', 'tab.unfocusedHoverBackground'],
  ['notifications.foreground', 'notifications.background'],
  ['notificationLink.foreground', 'notifications.background'],
  ['notificationCenterHeader.foreground', 'notificationCenterHeader.background'],
  ['descriptionForeground', 'sideBar.background'],
  ['descriptionForeground', 'editor.background'],
  ['disabledForeground', 'sideBar.background'],
  ['disabledForeground', 'editor.background'],
  ['disabledForeground', 'menu.background'],
  ['errorForeground', 'sideBar.background'],
  ['textLink.foreground', 'editor.background'],
  ['textLink.foreground', 'sideBar.background'],
  ['textLink.activeForeground', 'editor.background'],
  ['textPreformat.foreground', 'textPreformat.background'],
  ['keybindingLabel.foreground', 'keybindingLabel.background'],
  ['pickerGroup.foreground', 'quickInput.background'],
  ['settings.headerForeground', 'editor.background'],
  ['settings.textInputForeground', 'settings.textInputBackground'],
  ['settings.dropdownForeground', 'settings.dropdownBackground'],
  ['walkthrough.stepTitle.foreground', 'welcomePage.tileBackground'],

  // lists
  ['list.activeSelectionForeground', 'list.activeSelectionBackground'],
  ['list.inactiveSelectionForeground', 'list.inactiveSelectionBackground'],
  ['list.hoverForeground', 'list.hoverBackground'],
  ['list.focusForeground', 'list.focusBackground'],
  ['list.highlightForeground', 'sideBar.background'],
  ['list.highlightForeground', 'list.hoverBackground'],
  ['list.focusHighlightForeground', 'list.activeSelectionBackground'],
  ['list.errorForeground', 'sideBar.background'],
  ['list.warningForeground', 'sideBar.background'],
  ['list.invalidItemForeground', 'sideBar.background'],
  ['list.deemphasizedForeground', 'sideBar.background'],
  ['list.errorForeground', 'list.inactiveSelectionBackground'],
  ['list.warningForeground', 'list.inactiveSelectionBackground'],
  ['list.errorForeground', 'list.hoverBackground'],

  // inputs
  ['input.foreground', 'input.background'],
  ['input.placeholderForeground', 'input.background'],
  ['inputOption.activeForeground', ['input.background', 'inputOption.activeBackground']],
  ['inputValidation.errorForeground', 'inputValidation.errorBackground'],
  ['inputValidation.warningForeground', 'inputValidation.warningBackground'],
  ['inputValidation.infoForeground', 'inputValidation.infoBackground'],
  ['dropdown.foreground', 'dropdown.background'],
  ['inlineChatInput.placeholderForeground', 'inlineChatInput.background'],

  // editor and its widgets
  ['editor.foreground', 'editor.background'],
  ['editorLineNumber.activeForeground', 'editor.lineHighlightBackground'],
  ['editorCodeLens.foreground', 'editor.background'],
  ['editorGhostText.foreground', 'editor.background'],
  ['editorGhostText.foreground', 'editor.lineHighlightBackground'],
  ['editor.placeholder.foreground', 'editor.background'],
  ['editor.foldPlaceholderForeground', ['editor.background', 'editor.foldBackground']],
  ['editorInlayHint.foreground', 'editorInlayHint.background'],
  ['editorInlayHint.typeForeground', 'editorInlayHint.typeBackground'],
  ['editorInlayHint.parameterForeground', 'editorInlayHint.parameterBackground'],
  ['editor.inlineValuesForeground', 'editor.inlineValuesBackground'],
  ['editorLink.activeForeground', 'editor.background'],
  ['git.blame.editorDecorationForeground', 'editor.background'],
  ['editorWidget.foreground', 'editorWidget.background'],
  ['editorSuggestWidget.foreground', 'editorSuggestWidget.background'],
  ['editorSuggestWidget.selectedForeground', 'editorSuggestWidget.selectedBackground'],
  ['editorSuggestWidget.highlightForeground', 'editorSuggestWidget.background'],
  ['editorSuggestWidget.focusHighlightForeground', 'editorSuggestWidget.selectedBackground'],
  ['editorSuggestWidgetStatus.foreground', 'editorSuggestWidget.background'],
  ['editorHoverWidget.foreground', 'editorHoverWidget.background'],
  ['editorHoverWidget.foreground', 'editorHoverWidget.statusBarBackground'],
  ['editorActionList.foreground', 'editorActionList.background'],
  ['editorActionList.focusForeground', 'editorActionList.focusBackground'],
  ['quickInput.foreground', 'quickInput.background'],
  ['quickInputList.focusForeground', 'quickInputList.focusBackground'],
  ['peekViewResult.fileForeground', 'peekViewResult.background'],
  ['peekViewResult.lineForeground', 'peekViewResult.background'],
  ['peekViewResult.selectionForeground', 'peekViewResult.selectionBackground'],
  ['peekViewTitleLabel.foreground', 'peekViewTitle.background'],
  ['peekViewTitleDescription.foreground', 'peekViewTitle.background'],
  ['diffEditor.unchangedRegionForeground', 'diffEditor.unchangedRegionBackground'],

  // terminal, debug, git, testing, chat
  ['terminal.foreground', 'terminal.background'],
  ['terminal.initialHintForeground', 'terminal.background'],
  ['debugTokenExpression.name', 'sideBar.background'],
  ['debugTokenExpression.value', 'sideBar.background'],
  ['debugTokenExpression.string', 'sideBar.background'],
  ['debugTokenExpression.number', 'sideBar.background'],
  ['debugTokenExpression.boolean', 'sideBar.background'],
  ['debugTokenExpression.error', 'sideBar.background'],
  ['debugTokenExpression.type', 'sideBar.background'],
  ['debugTokenExpression.value', ['sideBar.background', 'debugView.valueChangedHighlight']],
  ['debugConsole.infoForeground', 'panel.background'],
  ['debugConsole.warningForeground', 'panel.background'],
  ['debugConsole.errorForeground', 'panel.background'],
  ['debugConsole.sourceForeground', 'panel.background'],
  ['gitDecoration.modifiedResourceForeground', 'sideBar.background'],
  ['gitDecoration.addedResourceForeground', 'sideBar.background'],
  ['gitDecoration.untrackedResourceForeground', 'sideBar.background'],
  ['gitDecoration.deletedResourceForeground', 'sideBar.background'],
  ['gitDecoration.renamedResourceForeground', 'sideBar.background'],
  ['gitDecoration.conflictingResourceForeground', 'sideBar.background'],
  ['gitDecoration.submoduleResourceForeground', 'sideBar.background'],
  ['gitDecoration.modifiedResourceForeground', 'list.inactiveSelectionBackground'],
  ['gitDecoration.deletedResourceForeground', 'list.hoverBackground'],
  ['testing.message.info.decorationForeground', 'editor.background'],
  ['chat.slashCommandForeground', ['chat.requestBackground', 'chat.slashCommandBackground']],
  ['chat.avatarForeground', 'chat.avatarBackground'],
];

for (const [fg, bg] of uiPairs) {
  const label = `${fg} on ${Array.isArray(bg) ? bg.join(' + ') : bg}`;
  check('UI text', label, contrast(id(fg), bgOf(bg)), 4.5);
}

// faint-coloured UI text falls under the 3:1 exception
for (const [fg, bg] of [
  ['editorLineNumber.foreground', 'editor.background'],
  ['editorWhitespace.foreground', 'editor.background'],
  ['gitDecoration.ignoredResourceForeground', 'sideBar.background'],
  ['gitDecoration.ignoredResourceForeground', 'list.hoverBackground'],
]) {
  check('Exception: faint >= 3:1', `${fg} on ${bg}`, contrast(id(fg), bgOf(bg)), 3);
}

// ---------------------------------------------------------------------------
// 5. Distance between syntax categories (CIE76 dE >= 12)
// ---------------------------------------------------------------------------

const categories = {
  comment: p.dim,
  string: p.accent,
  keyword: p.violet,
  function: p.cyan,
  type: p.amber,
  property: p.mint,
  variable: p.fg,
  number: p.orange,
};
const catNames = Object.keys(categories);
for (let i = 0; i < catNames.length; i++) {
  for (let j = i + 1; j < catNames.length; j++) {
    const [a, b] = [catNames[i], catNames[j]];
    check('Syntax category distance (dE)', `${a} vs ${b}`, deltaE(categories[a], categories[b]), 12);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const fmt = (r) => `${r.value.toFixed(2).padStart(6)}  (min ${r.min})  ${r.label}`;
const groups = [...new Set(results.map((r) => r.group))];
const failures = results.filter((r) => !r.pass);

console.log('NubiBuilds Dark: contrast check\n');
for (const g of groups) {
  const rs = results.filter((r) => r.group === g);
  const failed = rs.filter((r) => !r.pass);
  const lowest = [...rs].sort((a, b) => a.value / a.min - b.value / b.min).slice(0, 3);
  console.log(`${failed.length ? 'FAIL' : 'ok  '}  ${g}: ${rs.length - failed.length}/${rs.length} pass`);
  for (const r of lowest) console.log(`        lowest: ${fmt(r)}`);
}

console.log('\nNotes (allowed exceptions and informational values):');
for (const n of notes) console.log(`  - ${n}`);

if (failures.length) {
  console.log(`\n${failures.length} FAILURE(S):`);
  for (const r of failures) console.log(`  x [${r.group}] ${fmt(r)}`);
}

const textLowest = results
  .filter((r) => r.min === 4.5)
  .sort((a, b) => a.value - b.value)[0];
console.log(
  `\nSummary: ${results.length} checks, ${failures.length} failed. ` +
    `Lowest text pair (4.5:1 class): ${textLowest.label} = ${textLowest.value.toFixed(2)}:1`,
);

process.exit(failures.length ? 1 : 0);
