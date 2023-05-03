import type { CSSProperties } from "vue";
import {
  Compartment,
  EditorState,
  type EditorStateConfig,
  type Extension,
  RangeSet,
  StateEffect,
  StateField,
} from "@codemirror/state";
import {
  EditorView,
  type EditorViewConfig,
  gutter,
  GutterMarker,
  keymap,
  placeholder,
  ViewUpdate,
} from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";

export interface CreateStateOptions extends EditorStateConfig {
  onChange(doc: string, viewUpdate: ViewUpdate): void;
  onUpdate(viewUpdate: ViewUpdate): void;
  onFocus(viewUpdate: ViewUpdate): void;
  onBlur(viewUpdate: ViewUpdate): void;
}

export const createEditorState = (
  { onUpdate, onChange, onFocus, onBlur, ...config }: CreateStateOptions,
) => {
  return EditorState.create({
    doc: config.doc,
    selection: config.selection,
    extensions: [
      ...(Array.isArray(config.extensions)
        ? config.extensions
        : [config.extensions]),
      EditorView.updateListener.of((viewUpdate) => {
        // https://discuss.codemirror.net/t/codemirror-6-proper-way-to-listen-for-changes/2395/11
        onUpdate(viewUpdate);
        // doc changed
        if (viewUpdate.docChanged) {
          onChange(viewUpdate.state.doc.toString(), viewUpdate);
        }
        // focus state change
        if (viewUpdate.focusChanged) {
          viewUpdate.view.hasFocus ? onFocus(viewUpdate) : onBlur(viewUpdate);
        }
      }),
    ],
  });
};

export const createEditorView = (config: EditorViewConfig) =>
  new EditorView({ ...config });
export const destroyEditorView = (view: EditorView) => view.destroy();

// https://codemirror.net/examples/config/
// https://github.com/uiwjs/react-codemirror/blob/22cc81971a/src/useCodeMirror.ts#L144
// https://gist.github.com/s-cork/e7104bace090702f6acbc3004228f2cb
export const createEditorCompartment = (view: EditorView) => {
  const compartment = new Compartment();
  const run = (extension: Extension) => {
    compartment.get(view.state)
      ? view.dispatch({ effects: compartment.reconfigure(extension) }) // reconfigure
      : view.dispatch({
        effects: StateEffect.appendConfig.of(compartment.of(extension)),
      }); // inject
  };
  return { compartment, run };
};

// https://codemirror.net/examples/reconfigure/
export const createEditorExtensionToggler = (
  view: EditorView,
  extension: Extension,
) => {
  const { compartment, run } = createEditorCompartment(view);
  return (targetApply?: boolean) => {
    const exExtension = compartment.get(view.state);
    const apply = targetApply ?? exExtension !== extension;
    run(apply ? extension : []);
  };
};

export const getEditorTools = (view: EditorView) => {
  // doc state
  const getDoc = () => view.state.doc.toString();
  const setDoc = (newDoc: string) => {
    if (newDoc !== getDoc()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: newDoc,
        },
      });
    }
  };

  // UX operations
  const focus = () => view.focus();

  // reconfigure extension
  const { run: reExtensions } = createEditorCompartment(view);

  // disabled editor
  const toggleDisabled = createEditorExtensionToggler(view, [
    EditorView.editable.of(false),
    EditorState.readOnly.of(true),
  ]);

  // https://codemirror.net/examples/tab/
  const toggleIndentWithTab = createEditorExtensionToggler(
    view,
    keymap.of([indentWithTab]),
  );

  // tab size
  // https://gist.github.com/s-cork/e7104bace090702f6acbc3004228f2cb
  const { run: reTabSize } = createEditorCompartment(view);
  const setTabSize = (tabSize: number) => {
    reTabSize([
      EditorState.tabSize.of(tabSize),
      indentUnit.of(" ".repeat(tabSize)),
    ]);
  };

  // phrases
  // https://codemirror.net/examples/translate/
  const { run: rePhrases } = createEditorCompartment(view);
  const setPhrases = (phrases: Record<string, string>) => {
    rePhrases([EditorState.phrases.of(phrases)]);
  };

  // set editor's placeholder
  const { run: rePlaceholder } = createEditorCompartment(view);
  const setPlaceholder = (value: string) => {
    rePlaceholder(placeholder(value));
  };

  // set style to editor element
  // https://codemirror.net/examples/styling/
  const { run: reStyle } = createEditorCompartment(view);
  const setStyle = (style: CSSProperties = {}) => {
    reStyle(EditorView.theme({ "&": { ...(style as any) } }));
  };

  return {
    focus,
    getDoc,
    setDoc,
    reExtensions,
    toggleDisabled,
    toggleIndentWithTab,
    setTabSize,
    setPhrases,
    setPlaceholder,
    setStyle,
  };
};

const breakpointEffect = StateEffect.define<{ pos: number; on: boolean }>({
  map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), on: val.on }),
});

const breakpointMarker = new class extends GutterMarker {
  toDOM() {
    return document.createTextNode("●");
  }
}();

const breakpointState = StateField.define<RangeSet<GutterMarker>>({
  create() {
    return RangeSet.empty;
  },
  update(set, transaction) {
    set = set.map(transaction.changes);
    for (const e of transaction.effects) {
      if (e.is(breakpointEffect)) {
        if (e.value.on) {
          set = set.update({ add: [breakpointMarker.range(e.value.pos)] });
        } else {
          set = set.update({ filter: (from) => from != e.value.pos });
        }
      }
    }
    return set;
  },
});

function toggleBreakpoint(view: EditorView, pos: number) {
  const breakpoints = view.state.field(breakpointState);
  let hasBreakpoint = false;
  breakpoints.between(pos, pos, () => {
    hasBreakpoint = true;
  });
  view.dispatch({
    effects: breakpointEffect.of({ pos, on: !hasBreakpoint }),
  });
}

export const breakpointGutter = [
  breakpointState,
  gutter({
    class: "cm-breakpoint-gutter",
    markers: (v) => v.state.field(breakpointState),
    initialSpacer: () => breakpointMarker,
    domEventHandlers: {
      mousedown(view, line) {
        toggleBreakpoint(view, line.from);
        return true;
      },
    },
  }),
  EditorView.baseTheme({
    ".cm-breakpoint-gutter .cm-gutterElement": {
      color: "red",
      paddingLeft: "5px",
      cursor: "default",
    },
  }),
];
