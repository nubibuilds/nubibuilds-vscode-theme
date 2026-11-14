// Coverage checks for NubiBuilds Dark.
// Verifies the built theme JSON against: the official colour ID list, the
// required IDs per checklist section, the syntax and semantic token tables,
// and the palette. Exits non-zero when anything is missing or wrong.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { palette as p, THEME_PATH } from './build-theme.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

const failures = [];
const notes = [];
const fail = (section, msg) => failures.push(`[${section}] ${msg}`);

// ---------------------------------------------------------------------------
// 1. Theme file and manifest
// ---------------------------------------------------------------------------

let theme;
try {
  theme = JSON.parse(readFileSync(THEME_PATH, 'utf8'));
} catch (err) {
  console.error(`Theme JSON is missing or invalid: ${err.message}`);
  process.exit(1);
}
const C = theme.colors ?? {};
const rules = theme.tokenColors ?? [];
const semantic = theme.semanticTokenColors ?? {};

if (theme.type !== 'dark') fail('Theme file', `"type" must be "dark", found ${JSON.stringify(theme.type)}`);
if (theme.semanticHighlighting !== true) fail('Theme file', '"semanticHighlighting" must be true');

const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const contributed = pkg.contributes?.themes ?? [];
if (contributed.length !== 1) fail('Manifest', `expected exactly one contributed theme, found ${contributed.length}`);
for (const entry of contributed) {
  if (entry.uiTheme !== 'vs-dark') fail('Manifest', `uiTheme must be "vs-dark", found "${entry.uiTheme}"`);
  if (!existsSync(resolve(ROOT, entry.path))) fail('Manifest', `theme path does not exist: ${entry.path}`);
}

// ---------------------------------------------------------------------------
// 2. ANSI colours
// ---------------------------------------------------------------------------

for (const slot of ['Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White']) {
  const normal = C[`terminal.ansi${slot}`];
  const bright = C[`terminal.ansiBright${slot}`];
  if (!normal) fail('6. Terminal', `terminal.ansi${slot} is missing`);
  if (!bright) fail('6. Terminal', `terminal.ansiBright${slot} is missing`);
  if (normal && bright && normal === bright) fail('6. Terminal', `ANSI ${slot}: normal and bright are identical (${normal})`);
}

// ---------------------------------------------------------------------------
// 3. Every colour ID must be official
// ---------------------------------------------------------------------------

const official = JSON.parse(readFileSync(resolve(HERE, 'official-color-ids.json'), 'utf8'));
const officialSet = new Set(official.ids);
for (const id of Object.keys(C)) {
  if (!officialSet.has(id)) fail('Official IDs', `"${id}" is not in the Theme Color Reference snapshot (${official.fetched})`);
}

// High Contrast: these two IDs draw borders around everything and must stay
// unset in a regular theme.
for (const id of ['contrastBorder', 'contrastActiveBorder']) {
  if (id in C) fail('14. Accessibility', `${id} must not be set outside a High Contrast theme`);
}

// ---------------------------------------------------------------------------
// 4. Required colour IDs per checklist section
// ---------------------------------------------------------------------------

const required = {
  '1. Workbench UI': [
    'activityBar.background', 'activityBar.foreground', 'activityBar.inactiveForeground', 'activityBar.activeBorder',
    'activityBar.border', 'activityBarBadge.background', 'activityBarBadge.foreground',
    'sideBar.background', 'sideBar.foreground', 'sideBar.border', 'sideBarTitle.foreground',
    'sideBarSectionHeader.background', 'sideBarSectionHeader.foreground', 'sideBarSectionHeader.border',
    'panel.background', 'panel.border', 'panelTitle.activeForeground', 'panelTitle.activeBorder', 'panelTitle.inactiveForeground',
    'statusBar.background', 'statusBar.foreground', 'statusBar.border', 'statusBar.debuggingBackground',
    'statusBar.debuggingForeground', 'statusBar.noFolderBackground', 'statusBar.noFolderForeground',
    'statusBarItem.hoverBackground', 'statusBarItem.remoteBackground', 'statusBarItem.remoteForeground',
    'statusBarItem.errorBackground', 'statusBarItem.errorForeground', 'statusBarItem.warningBackground', 'statusBarItem.warningForeground',
    'titleBar.activeBackground', 'titleBar.activeForeground', 'titleBar.inactiveBackground', 'titleBar.inactiveForeground', 'titleBar.border',
    'menubar.selectionBackground', 'menubar.selectionForeground',
    'commandCenter.foreground', 'commandCenter.activeForeground', 'commandCenter.background', 'commandCenter.activeBackground',
    'commandCenter.border', 'commandCenter.inactiveForeground',
    'breadcrumb.foreground', 'breadcrumb.background', 'breadcrumb.focusForeground', 'breadcrumb.activeSelectionForeground',
    'notifications.background', 'notifications.foreground', 'notifications.border', 'notificationToast.border',
    'notificationCenter.border', 'notificationCenterHeader.background', 'notificationCenterHeader.foreground',
    'notificationsErrorIcon.foreground', 'notificationsWarningIcon.foreground', 'notificationsInfoIcon.foreground',
    'editorGroup.border', 'editorGroup.dropBackground', 'editorGroupHeader.tabsBackground', 'editorGroupHeader.tabsBorder',
    'tab.activeBackground', 'tab.activeForeground', 'tab.activeBorderTop', 'tab.inactiveBackground', 'tab.inactiveForeground',
    'tab.hoverBackground', 'tab.border', 'tab.activeModifiedBorder', 'tab.inactiveModifiedBorder', 'tab.lastPinnedBorder',
    'tab.unfocusedActiveBackground', 'tab.unfocusedActiveForeground', 'tab.unfocusedInactiveForeground', 'tab.dragAndDropBorder',
    'scrollbar.shadow', 'scrollbarSlider.background', 'scrollbarSlider.hoverBackground', 'scrollbarSlider.activeBackground',
    'focusBorder', 'foreground', 'disabledForeground', 'descriptionForeground', 'errorForeground', 'icon.foreground',
    'selection.background', 'widget.shadow', 'sash.hoverBorder',
    'button.background', 'button.foreground', 'button.hoverBackground', 'button.secondaryBackground', 'button.secondaryForeground',
    'button.secondaryHoverBackground', 'button.secondaryBorder',
    'checkbox.background', 'checkbox.foreground', 'checkbox.border', 'radio.activeBackground', 'radio.activeBorder', 'radio.inactiveBorder',
    'inputOption.activeBackground', 'badge.background', 'badge.foreground', 'progressBar.background',
    'textLink.foreground', 'textLink.activeForeground', 'textCodeBlock.background', 'textBlockQuote.background', 'textBlockQuote.border',
    'textPreformat.foreground', 'textPreformat.background', 'textSeparator.foreground',
    'keybindingLabel.background', 'keybindingLabel.foreground', 'keybindingLabel.border', 'keybindingLabel.bottomBorder',
  ],
  '2. File Explorer': [
    'sideBar.background', 'sideBar.foreground', 'sideBarSectionHeader.foreground',
    'list.activeSelectionBackground', 'list.activeSelectionForeground', 'list.inactiveSelectionBackground', 'list.inactiveSelectionForeground',
    'list.focusBackground', 'list.focusForeground', 'list.focusOutline', 'list.hoverBackground', 'list.hoverForeground',
    'list.dropBackground', 'list.highlightForeground', 'list.filterMatchBackground', 'list.filterMatchBorder',
    'list.errorForeground', 'list.warningForeground', 'list.deemphasizedForeground',
    'tree.indentGuidesStroke', 'tree.inactiveIndentGuidesStroke',
    'menu.background', 'menu.foreground', 'menu.selectionBackground', 'menu.selectionForeground', 'menu.separatorBackground', 'menu.border',
    'toolbar.hoverBackground', 'sideBar.dropBackground',
    'gitDecoration.modifiedResourceForeground', 'gitDecoration.untrackedResourceForeground',
  ],
  '3. Editor': [
    'editor.background', 'editor.foreground', 'editorLineNumber.foreground', 'editorLineNumber.activeForeground',
    'editor.lineHighlightBackground', 'editorCursor.foreground', 'editor.selectionBackground', 'editor.inactiveSelectionBackground',
    'editor.selectionHighlightBackground', 'editor.wordHighlightBackground', 'editor.wordHighlightBorder',
    'editor.wordHighlightStrongBackground', 'editor.wordHighlightStrongBorder',
    'editorBracketMatch.background', 'editorBracketMatch.border',
    'editorIndentGuide.background1', 'editorIndentGuide.activeBackground1', 'editorWhitespace.foreground',
    'minimap.background', 'minimapSlider.background', 'minimapSlider.hoverBackground', 'minimapSlider.activeBackground',
    'minimap.findMatchHighlight', 'minimap.selectionHighlight', 'minimap.errorHighlight', 'minimap.warningHighlight',
    'minimapGutter.addedBackground', 'minimapGutter.modifiedBackground', 'minimapGutter.deletedBackground',
    'editorRuler.foreground', 'editorGutter.foldingControlForeground', 'editor.foldBackground',
    'editorOverviewRuler.border', 'editorOverviewRuler.errorForeground', 'editorOverviewRuler.warningForeground',
    'editorOverviewRuler.infoForeground', 'editorOverviewRuler.findMatchForeground', 'editorOverviewRuler.addedForeground',
    'editorOverviewRuler.modifiedForeground', 'editorOverviewRuler.deletedForeground',
    'editorGutter.background', 'editorGutter.addedBackground', 'editorGutter.modifiedBackground', 'editorGutter.deletedBackground',
    'editorStickyScroll.background', 'editorStickyScroll.border', 'editorStickyScrollHover.background',
    'diffEditor.insertedLineBackground', 'diffEditor.insertedTextBackground', 'diffEditor.removedLineBackground',
    'diffEditor.removedTextBackground', 'diffEditor.diagonalFill', 'diffEditor.border',
    'merge.currentHeaderBackground', 'merge.currentContentBackground', 'merge.incomingHeaderBackground',
    'merge.incomingContentBackground', 'merge.commonHeaderBackground', 'merge.commonContentBackground',
    'mergeEditor.change.background', 'mergeEditor.conflict.unhandledFocused.border', 'mergeEditor.conflict.handledFocused.border',
    ...[1, 2, 3, 4, 5, 6].map((n) => `editorBracketHighlight.foreground${n}`),
    'editorBracketHighlight.unexpectedBracket.foreground',
    'editorError.foreground', 'editorWarning.foreground', 'editorInfo.foreground', 'editorHint.foreground', 'editorUnnecessaryCode.opacity',
    'editorInlayHint.foreground', 'editorInlayHint.background', 'editorCodeLens.foreground', 'editorGhostText.foreground',
    'editorWidget.background', 'editorWidget.border', 'editorWidget.foreground',
    'peekView.border', 'peekViewEditor.background', 'peekViewEditor.matchHighlightBackground', 'peekViewResult.background',
    'peekViewResult.matchHighlightBackground', 'peekViewResult.selectionBackground', 'peekViewTitle.background',
    'peekViewTitleLabel.foreground', 'peekViewTitleDescription.foreground',
    'editorLink.activeForeground', 'editor.linkedEditingBackground', 'editor.snippetTabstopHighlightBackground',
    'editor.snippetFinalTabstopHighlightBorder',
  ],
  '6. Terminal': [
    'terminal.background', 'terminal.foreground', 'terminalCursor.foreground', 'terminalCursor.background',
    'terminal.selectionBackground', 'terminal.inactiveSelectionBackground', 'terminal.border', 'terminal.tab.activeBorder',
    'terminalCommandDecoration.defaultBackground', 'terminalCommandDecoration.successBackground', 'terminalCommandDecoration.errorBackground',
    'terminal.findMatchBackground', 'terminal.findMatchBorder', 'terminal.findMatchHighlightBackground',
    'terminalStickyScroll.background', 'terminalStickyScrollHover.background',
  ],
  '7. Panel and output': [
    'panel.background', 'panelTitle.activeForeground', 'panelTitle.inactiveForeground', 'panelTitle.activeBorder',
    'problemsErrorIcon.foreground', 'problemsWarningIcon.foreground', 'problemsInfoIcon.foreground',
    'outputView.background', 'debugConsole.infoForeground', 'debugConsole.warningForeground', 'debugConsole.errorForeground',
    'debugConsole.sourceForeground', 'debugConsoleInputIcon.foreground', 'ports.iconRunningProcessForeground',
    'testing.iconPassed', 'testing.iconFailed', 'panelSectionHeader.background', 'panelInput.border',
  ],
  '8. Search & Replace': [
    'input.background', 'input.foreground', 'input.border', 'input.placeholderForeground',
    'inputOption.activeBackground', 'inputOption.activeBorder', 'inputOption.activeForeground', 'inputOption.hoverBackground',
    'inputValidation.infoBackground', 'inputValidation.infoForeground', 'inputValidation.infoBorder',
    'inputValidation.warningBackground', 'inputValidation.warningForeground', 'inputValidation.warningBorder',
    'inputValidation.errorBackground', 'inputValidation.errorForeground', 'inputValidation.errorBorder',
    'editor.findMatchBackground', 'editor.findMatchBorder', 'editor.findMatchHighlightBackground', 'editor.findMatchHighlightBorder',
    'editor.findRangeHighlightBackground', 'searchEditor.findMatchBackground', 'searchEditor.textInputBorder',
    'search.resultsInfoForeground', 'list.highlightForeground', 'editorOverviewRuler.findMatchForeground',
  ],
  '9. Source Control': [
    'gitDecoration.modifiedResourceForeground', 'gitDecoration.addedResourceForeground', 'gitDecoration.deletedResourceForeground',
    'gitDecoration.renamedResourceForeground', 'gitDecoration.conflictingResourceForeground', 'gitDecoration.untrackedResourceForeground',
    'gitDecoration.ignoredResourceForeground', 'gitDecoration.submoduleResourceForeground',
    'gitDecoration.stageModifiedResourceForeground', 'gitDecoration.stageDeletedResourceForeground',
    'diffEditor.insertedLineBackground', 'diffEditor.removedLineBackground', 'diffEditorGutter.insertedLineBackground',
    'diffEditorGutter.removedLineBackground', 'diffEditorOverview.insertedForeground', 'diffEditorOverview.removedForeground',
    'editorGutter.addedBackground', 'editorGutter.modifiedBackground', 'editorGutter.deletedBackground',
    ...[1, 2, 3, 4, 5].map((n) => `scmGraph.foreground${n}`),
    'scmGraph.historyItemRefColor', 'scmGraph.historyItemRemoteRefColor', 'scmGraph.historyItemBaseRefColor',
  ],
  '10. Debugging': [
    'debugIcon.breakpointForeground', 'debugIcon.breakpointDisabledForeground', 'debugIcon.breakpointUnverifiedForeground',
    'debugIcon.breakpointCurrentStackframeForeground', 'debugIcon.breakpointStackframeForeground',
    'editor.stackFrameHighlightBackground', 'editor.focusedStackFrameHighlightBackground',
    'debugToolBar.background', 'debugToolBar.border', 'debugIcon.startForeground', 'debugIcon.pauseForeground',
    'debugIcon.stopForeground', 'debugIcon.restartForeground', 'debugIcon.stepOverForeground', 'debugIcon.stepIntoForeground',
    'debugIcon.stepOutForeground', 'debugIcon.continueForeground', 'debugIcon.disconnectForeground',
    'statusBar.debuggingBackground', 'statusBar.debuggingForeground',
    'editor.inlineValuesForeground', 'editor.inlineValuesBackground',
    'debugTokenExpression.name', 'debugTokenExpression.value', 'debugTokenExpression.string', 'debugTokenExpression.number',
    'debugTokenExpression.boolean', 'debugTokenExpression.error', 'debugTokenExpression.type',
    'debugExceptionWidget.background', 'debugExceptionWidget.border',
    'debugView.stateLabelBackground', 'debugView.stateLabelForeground', 'debugView.valueChangedHighlight',
  ],
  '11. IntelliSense and language widgets': [
    'editorSuggestWidget.background', 'editorSuggestWidget.border', 'editorSuggestWidget.foreground',
    'editorSuggestWidget.selectedBackground', 'editorSuggestWidget.selectedForeground', 'editorSuggestWidget.highlightForeground',
    'editorSuggestWidget.focusHighlightForeground', 'editorSuggestWidgetStatus.foreground',
    'editorHoverWidget.background', 'editorHoverWidget.border', 'editorHoverWidget.foreground',
    'editorHoverWidget.highlightForeground', 'editorHoverWidget.statusBarBackground',
    'editorActionList.background', 'editorActionList.foreground', 'editorActionList.focusBackground', 'editorActionList.focusForeground',
    'editorLightBulb.foreground', 'editorLightBulbAutoFix.foreground',
    'symbolIcon.classForeground', 'symbolIcon.interfaceForeground', 'symbolIcon.enumeratorForeground',
    'symbolIcon.enumeratorMemberForeground', 'symbolIcon.functionForeground', 'symbolIcon.methodForeground',
    'symbolIcon.propertyForeground', 'symbolIcon.fieldForeground', 'symbolIcon.variableForeground', 'symbolIcon.constantForeground',
    'symbolIcon.keywordForeground', 'symbolIcon.stringForeground', 'symbolIcon.numberForeground', 'symbolIcon.namespaceForeground',
    'symbolIcon.moduleForeground', 'symbolIcon.typeParameterForeground', 'symbolIcon.snippetForeground',
  ],
  '12. Dialogs, menus and notifications': [
    'quickInput.background', 'quickInput.foreground', 'quickInputTitle.background', 'quickInputList.focusBackground',
    'quickInputList.focusForeground', 'pickerGroup.border', 'pickerGroup.foreground',
    'menu.background', 'menu.foreground', 'menu.selectionBackground', 'menu.border',
    'dropdown.background', 'dropdown.foreground', 'dropdown.border', 'dropdown.listBackground',
    'editorWidget.background', 'widget.shadow', 'widget.border', 'button.background', 'button.secondaryBackground',
    'input.background', 'input.border', 'notifications.background', 'notificationToast.border', 'notificationCenter.border',
    'progressBar.background',
  ],
  '13. Widgets and specialized UI': [
    'breadcrumbPicker.background', 'tree.tableColumnsBorder', 'tree.tableOddRowsBackground',
    'settings.headerForeground', 'settings.modifiedItemIndicator', 'settings.textInputBackground', 'settings.textInputBorder',
    'settings.checkboxBackground', 'settings.checkboxBorder', 'settings.dropdownBackground', 'settings.dropdownBorder',
    'settings.focusedRowBackground', 'settings.rowHoverBackground', 'settings.focusedRowBorder',
    'extensionButton.prominentBackground', 'extensionButton.prominentForeground', 'extensionButton.prominentHoverBackground',
    'extensionBadge.remoteBackground', 'extensionIcon.starForeground', 'extensionIcon.verifiedForeground',
    'welcomePage.background', 'welcomePage.tileBackground', 'welcomePage.tileHoverBackground', 'welcomePage.progress.foreground',
    'chat.requestBackground', 'chat.requestBorder', 'chat.slashCommandForeground', 'inlineChat.background', 'inlineChatInput.background',
    'notebook.editorBackground', 'notebook.cellEditorBackground', 'notebook.cellBorderColor', 'notebook.focusedCellBorder',
    'notebook.selectedCellBackground', 'notebookStatusSuccessIcon.foreground', 'notebookStatusErrorIcon.foreground',
    'interactive.activeCodeBorder', 'interactive.inactiveCodeBorder',
    'testing.iconPassed', 'testing.iconFailed', 'testing.iconErrored', 'testing.iconSkipped', 'testing.iconQueued', 'testing.iconUnset',
    'charts.foreground', 'charts.lines', 'charts.red', 'charts.blue', 'charts.yellow', 'charts.orange', 'charts.green', 'charts.purple',
    'banner.background', 'banner.foreground', 'banner.iconForeground',
    'keybindingTable.headerBackground', 'keybindingTable.rowsBackground',
  ],
  '14. Accessibility and visual states': [
    'focusBorder', 'list.focusOutline', 'list.focusAndSelectionOutline', 'list.inactiveFocusOutline',
    'list.activeSelectionBackground', 'list.hoverBackground', 'disabledForeground',
    'editorError.foreground', 'editorWarning.foreground', 'editorInfo.foreground',
    'problemsErrorIcon.foreground', 'problemsWarningIcon.foreground', 'problemsInfoIcon.foreground', 'testing.iconPassed',
  ],
};

let requiredCount = 0;
for (const [section, ids] of Object.entries(required)) {
  const missing = ids.filter((id) => !(id in C));
  requiredCount += ids.length;
  if (missing.length) fail(section, `missing colour IDs: ${missing.join(', ')}`);
  for (const id of ids) {
    if (!officialSet.has(id)) fail(section, `required ID "${id}" is not an official colour ID (fix the checker)`);
  }
}

// ---------------------------------------------------------------------------
// 5. TextMate scopes (checklist section 4)
// ---------------------------------------------------------------------------

const segs = (s) => s.split('.');
const prefixMatch = (selector, scope) => {
  const a = segs(selector);
  const b = segs(scope);
  return a.length <= b.length && a.every((seg, i) => seg === b[i]);
};

/** Simplified TextMate resolution: deepest scope first, then the most specific selector. */
function resolveScope(stackString) {
  const stack = stackString.split(' ');
  const candidates = [];
  rules.forEach((r, order) => {
    const selectors = Array.isArray(r.scope) ? r.scope : String(r.scope).split(',').map((s) => s.trim());
    for (const sel of selectors) {
      const parts = sel.split(' ');
      const last = parts[parts.length - 1];
      for (let i = stack.length - 1; i >= 0; i--) {
        if (!prefixMatch(last, stack[i])) continue;
        // parent parts must match earlier scopes, in order
        let at = i - 1;
        let ok = true;
        for (let k = parts.length - 2; k >= 0; k--) {
          while (at >= 0 && !prefixMatch(parts[k], stack[at])) at--;
          if (at < 0) { ok = false; break; }
          at--;
        }
        if (ok) {
          candidates.push({ score: [i, segs(last).length, parts.length, order], settings: r.settings, selector: sel });
          break;
        }
      }
    }
  });
  candidates.sort((a, b) => {
    for (let i = 0; i < 4; i++) if (a.score[i] !== b.score[i]) return b.score[i] - a.score[i];
    return 0;
  });
  const fg = candidates.find((c) => c.settings.foreground !== undefined);
  const style = candidates.find((c) => c.settings.fontStyle !== undefined);
  return {
    matched: candidates.length > 0,
    foreground: fg ? fg.settings.foreground : C['editor.foreground'],
    fontStyle: style ? style.settings.fontStyle : '',
    selector: candidates[0]?.selector,
  };
}

// [category, scope stack, palette key, fontStyle]
const scopeTable = [
  ['Comment (line)', 'comment.line.double-slash', 'dim', 'italic'],
  ['Comment (block)', 'comment.block', 'dim', 'italic'],
  ['Comment (documentation)', 'comment.block.documentation', 'dim', 'italic'],
  ['Doc tag', 'comment.block.documentation storage.type.class.jsdoc', 'violet', 'italic'],
  ['Doc parameter name', 'comment.block.documentation variable.other.jsdoc', 'fg', 'italic'],
  ['Keyword', 'keyword.control.flow', 'violet', ''],
  ['Storage', 'storage.type.function', 'violet', ''],
  ['Storage modifier', 'storage.modifier.async', 'violet', ''],
  ['Import', 'keyword.control.import', 'violet', ''],
  ['Export', 'keyword.control.export', 'violet', ''],
  ['new / typeof', 'keyword.operator.new', 'violet', ''],
  ['this', 'variable.language.this', 'violet', 'italic'],
  ['super', 'variable.language.super', 'violet', 'italic'],
  ['self (Python)', 'variable.parameter.function.language.special.self.python', 'violet', 'italic'],
  ['Variable', 'variable.other.readwrite', 'fg', ''],
  ['Parameter', 'variable.parameter', 'hi', 'italic'],
  ['Function declaration', 'meta.definition.function entity.name.function', 'cyan', ''],
  ['Function call', 'meta.function-call entity.name.function', 'cyan', ''],
  ['Method', 'meta.definition.method entity.name.function', 'cyan', ''],
  ['Class', 'entity.name.type.class', 'amber', ''],
  ['Interface', 'entity.name.type.interface', 'amber', ''],
  ['Type alias', 'entity.name.type.alias', 'amber', ''],
  ['Enum', 'entity.name.type.enum', 'amber', ''],
  ['Inherited class', 'entity.other.inherited-class', 'amber', ''],
  ['Enum member', 'variable.other.enummember', 'orange', ''],
  ['Constant', 'variable.other.constant', 'orange', ''],
  ['Number', 'constant.numeric.decimal', 'orange', ''],
  ['Boolean', 'constant.language.boolean.true', 'orange', ''],
  ['null', 'constant.language.null', 'orange', ''],
  ['undefined', 'constant.language.undefined', 'orange', ''],
  ['String', 'string.quoted.double', 'accent', ''],
  ['Template literal', 'string.template', 'accent', ''],
  ['String escape', 'string.quoted.double constant.character.escape', 'teal', ''],
  ['Regular expression', 'string.regexp', 'teal', ''],
  ['Template ${}', 'string.template punctuation.definition.template-expression.begin', 'violet', ''],
  ['Operator', 'keyword.operator.assignment', 'operator', ''],
  ['Punctuation', 'punctuation.separator.comma', 'dim', ''],
  ['Terminator', 'punctuation.terminator.statement', 'dim', ''],
  ['Brace', 'meta.brace.round', 'dim', ''],
  ['Object property', 'variable.other.property', 'mint', ''],
  ['Object literal key', 'meta.object-literal.key', 'mint', ''],
  ['Decorator', 'meta.decorator entity.name.function', 'amber', 'italic'],
  ['Decorator (identifier)', 'meta.decorator variable.other.readwrite', 'amber', 'italic'],
  ['Decorator (Python)', 'entity.name.function.decorator.python', 'amber', 'italic'],
  ['Annotation (Java)', 'storage.type.annotation.java', 'amber', 'italic'],
  ['Support function', 'support.function', 'cyan', 'italic'],
  ['Support class', 'support.class', 'amber', 'italic'],
  ['Support type', 'support.type.primitive', 'amber', 'italic'],
  ['Support constant', 'support.constant', 'orange', 'italic'],
  ['Namespace', 'entity.name.namespace', 'teal', ''],
  ['Module', 'entity.name.type.module', 'teal', ''],
  ['HTML tag', 'entity.name.tag.html', 'coral', ''],
  ['JSX component', 'entity.name.tag support.class.component.tsx', 'amber', ''],
  ['HTML attribute', 'entity.other.attribute-name.html', 'amber', 'italic'],
  ['CSS class selector', 'entity.other.attribute-name.class.css', 'amber', ''],
  ['CSS id selector', 'entity.other.attribute-name.id.css', 'cyan', ''],
  ['CSS pseudo selector', 'entity.other.attribute-name.pseudo-class.css', 'violet', ''],
  ['CSS property name', 'support.type.property-name.css', 'mint', ''],
  ['CSS value', 'support.constant.property-value.css', 'orange', ''],
  ['CSS unit', 'keyword.other.unit.px.css', 'orange', ''],
  ['JSON key', 'support.type.property-name.json', 'mint', ''],
  ['YAML key', 'entity.name.tag.yaml', 'mint', ''],
  ['Markdown heading', 'markup.heading.1.markdown', 'accent', 'bold'],
  ['Markdown bold', 'markup.bold.markdown', 'hi', 'bold'],
  ['Markdown italic', 'markup.italic.markdown', 'hi', 'italic'],
  ['Markdown link', 'markup.underline.link.markdown', 'cyan', 'underline'],
  ['Markdown inline code', 'markup.inline.raw.string.markdown', 'amber', ''],
  ['Markdown code block', 'markup.fenced_code.block.markdown', 'amber', ''],
  ['Markdown quote', 'markup.quote.markdown', 'dim', 'italic'],
  ['Markdown list marker', 'punctuation.definition.list.begin.markdown', 'violet', ''],
  ['Diff inserted', 'markup.inserted.diff', 'accent', ''],
  ['Diff deleted', 'markup.deleted.diff', 'coral', ''],
  ['Diff changed', 'markup.changed.diff', 'amber', ''],
  ['Invalid', 'invalid.illegal', 'coral', ''],
  ['Deprecated', 'invalid.deprecated', 'fg', 'strikethrough'],
];

for (const [category, scope, key, fontStyle] of scopeTable) {
  const got = resolveScope(scope);
  if (!got.matched) {
    fail('4. Syntax', `${category}: no rule matches "${scope}"`);
    continue;
  }
  if (got.foreground !== p[key]) {
    fail('4. Syntax', `${category} ("${scope}"): expected ${key} ${p[key]}, got ${got.foreground} via "${got.selector}"`);
  }
  if (got.fontStyle !== fontStyle) {
    fail('4. Syntax', `${category} ("${scope}"): expected fontStyle "${fontStyle}", got "${got.fontStyle}"`);
  }
}

// ---------------------------------------------------------------------------
// 6. Semantic tokens (checklist section 5)
// ---------------------------------------------------------------------------

const normalise = (value) => {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return { foreground: value, styles: [] };
  const styles = ['bold', 'italic', 'underline', 'strikethrough'].filter((s) => value[s] === true);
  if (typeof value.fontStyle === 'string') styles.push(...value.fontStyle.split(' ').filter(Boolean));
  return { foreground: value.foreground, styles: [...new Set(styles)].sort() };
};

// [selector, palette key or null (keeps the original colour), styles]
const semanticTable = [
  ['class', 'amber', []], ['interface', 'amber', []], ['enum', 'amber', []], ['type', 'amber', []],
  ['typeParameter', 'amber', []], ['struct', 'amber', []],
  ['function', 'cyan', []], ['method', 'cyan', []],
  ['property', 'mint', []], ['variable', 'fg', []], ['parameter', 'hi', ['italic']],
  ['namespace', 'teal', []], ['keyword', 'violet', []], ['decorator', 'amber', ['italic']],
  ['operator', 'operator', []], ['macro', 'cyan', ['bold']], ['enumMember', 'orange', []],
  ['variable.readonly', 'orange', []], ['property.readonly', 'mint', []],
  ['*.static', null, ['bold']], ['*.async', null, ['italic']], ['*.deprecated', null, ['strikethrough']],
  ['*.defaultLibrary', null, ['italic']], ['*.modification', null, ['underline']],
];
// Decisions that intentionally have no rule.
const semanticDecisions = {
  '*.declaration': 'no rule: a declaration keeps the colour and style of its token type',
};

for (const [selector, key, styles] of semanticTable) {
  const got = normalise(semantic[selector]);
  if (!got) {
    fail('5. Semantic', `no semanticTokenColors rule for "${selector}"`);
    continue;
  }
  const want = key ? p[key] : undefined;
  if (got.foreground !== want) {
    fail('5. Semantic', `"${selector}": expected foreground ${key ?? 'unset (original colour)'}, got ${got.foreground}`);
  }
  if (got.styles.join(' ') !== [...styles].sort().join(' ')) {
    fail('5. Semantic', `"${selector}": expected styles [${styles}], got [${got.styles}]`);
  }
}
for (const [selector, why] of Object.entries(semanticDecisions)) {
  if (selector in semantic) fail('5. Semantic', `"${selector}" should have no rule (${why})`);
  notes.push(`semantic "${selector}": ${why}`);
}

// TextMate and semantic must agree for the same kind of token.
const agreement = [
  ['class', 'entity.name.type.class'], ['interface', 'entity.name.type.interface'], ['enum', 'entity.name.type.enum'],
  ['type', 'entity.name.type.alias'], ['typeParameter', 'entity.name.type.parameter'], ['struct', 'entity.name.type.struct'],
  ['function', 'entity.name.function'], ['method', 'entity.name.function.member'],
  ['property', 'variable.other.property'], ['variable', 'variable.other.readwrite'], ['parameter', 'variable.parameter'],
  ['namespace', 'entity.name.namespace'], ['keyword', 'keyword.control'], ['decorator', 'entity.name.function.decorator'],
  ['operator', 'keyword.operator'], ['macro', 'entity.name.function.macro'], ['enumMember', 'variable.other.enummember'],
  ['variable.readonly', 'variable.other.constant'], ['string', 'string.quoted.double'], ['number', 'constant.numeric'],
  ['regexp', 'string.regexp'], ['comment', 'comment.line'], ['selfParameter', 'variable.language.special.self.python'],
  ['builtinType', 'support.type.primitive'], ['lifetime', 'entity.name.lifetime.rust'],
];
for (const [selector, scope] of agreement) {
  const sem = normalise(semantic[selector]);
  const tm = resolveScope(scope);
  if (!sem) continue;
  const tmStyles = tm.fontStyle.split(' ').filter(Boolean).sort().join(' ');
  if (sem.foreground !== tm.foreground || sem.styles.join(' ') !== tmStyles) {
    fail(
      '5. Semantic',
      `semantic "${selector}" (${sem.foreground} [${sem.styles}]) disagrees with TextMate "${scope}" (${tm.foreground} [${tmStyles}])`,
    );
  }
}

// ---------------------------------------------------------------------------
// 7. Every hex value must come from the palette
// ---------------------------------------------------------------------------

const paletteRgb = new Set(Object.values(p).map((h) => h.toLowerCase()));
const seen = new Set();
(function walk(node, path) {
  if (typeof node === 'string') {
    if (/^#[0-9a-fA-F]{3,8}$/.test(node)) {
      seen.add(node.toLowerCase());
      if (!/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(node)) fail('Palette', `${path}: use #rrggbb or #rrggbbaa, found ${node}`);
      else if (!paletteRgb.has(node.slice(0, 7).toLowerCase())) fail('Palette', `${path}: ${node} is not a palette colour`);
    }
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
  }
})({ colors: theme.colors, tokenColors: theme.tokenColors, semanticTokenColors: theme.semanticTokenColors }, '');

const usedRgb = new Set([...seen].map((h) => h.slice(0, 7)));
const unusedPalette = Object.entries(p).filter(([, h]) => !usedRgb.has(h)).map(([k]) => k);
if (unusedPalette.length) notes.push(`palette colours not used by the theme: ${unusedPalette.join(', ')}`);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const unset = official.ids.filter((id) => !(id in C));
const unsetByPrefix = {};
for (const id of unset) {
  const prefix = id.includes('.') ? id.split('.')[0] : '(top level)';
  unsetByPrefix[prefix] = (unsetByPrefix[prefix] ?? 0) + 1;
}

console.log('NubiBuilds Dark: coverage check\n');
console.log(`  colour IDs set:            ${Object.keys(C).length} (all checked against ${official.count} official IDs, snapshot ${official.fetched})`);
console.log(`  required IDs checked:      ${requiredCount} across ${Object.keys(required).length} checklist sections`);
console.log(`  TextMate token rules:      ${rules.length} (${rules.reduce((n, r) => n + [].concat(r.scope).length, 0)} scope selectors)`);
console.log(`  scope categories checked:  ${scopeTable.length}`);
console.log(`  semantic token rules:      ${Object.keys(semantic).length} (${semanticTable.length} required, ${agreement.length} compared with TextMate)`);
console.log(`  distinct colour values:    ${seen.size} (from ${usedRgb.size} palette colours)`);
console.log(`  official IDs left default: ${unset.length}`);
console.log(
  '    ' +
    Object.entries(unsetByPrefix)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ${n}`)
      .join(', '),
);

if (notes.length) {
  console.log('\nNotes:');
  for (const n of notes) console.log(`  - ${n}`);
}

if (failures.length) {
  console.log(`\n${failures.length} FAILURE(S):`);
  for (const f of failures) console.log(`  x ${f}`);
  process.exit(1);
}
console.log('\nAll coverage checks passed.');
