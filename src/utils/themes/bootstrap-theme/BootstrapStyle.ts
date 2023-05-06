/**
 * Bootstrap Style wrapper.
 */
import { toJSON } from 'css-convert-json';
import bootstrap from './bootstrap.min.css?raw';
import { mapKeys, camelCase } from 'lodash';

/** Bootstrap theme */
const style = toJSON(bootstrap).children;

/** Root theme */
const root = style[':root'].attributes;

/** Font family */
const font = root['--bs-font-monospace'];

/** Line height */
const lineHeight = root['--bs-body-line-height'];

/** Border Radius */
const radius = root['--bs-border-radius'];

// Generic Bootstrap Colors
const colors = {
  blue: root['--bs-blue'], // Equals to primary
  indigo: root['--bs-indigo'],
  purple: root['--bs-purple'],
  pink: root['--bs-pink'],
  red: root['--bs-red'], // Equals to danger
  orange: root['--bs-orange'],
  yellow: root['--bs-yellow'], // Equals to warning
  green: root['--bs-green'], // Equals to success
  teal: root['--bs-teal'],
  cyan: root['--bs-cyan'], // Equals to info
  dark: root['--bs-dark'],
  light: root['--bs-light'],
  white: root['--bs-white'],
  black: root['--bs-black'],
  gray: [
    root['--bs-white'],
    root['--bs-gray-100'], // Equals to light
    root['--bs-gray-200'], // Equals to disabled background, assume original light1
    root['--bs-gray-300'],
    root['--bs-gray-400'],
    root['--bs-gray-500'],
    root['--bs-gray-600'], // Equals to secondary
    root['--bs-gray-700'],
    root['--bs-gray-800'], // assume original light1
    root['--bs-gray-900'], // Equals to dark
  ],
};

/** Bootsrap Form Style */
const form = (isDark: boolean = false, isInput: boolean = true) => {
  const formColor = {
    backgroundColor: isDark ? colors.black : colors.white,
    color: isDark ? colors.light : colors.dark,
  };

  return {
    ...mapKeys(style['.form-control'].attributes, (_v: any, k: string) =>
      camelCase(k)
    ),
    ...(isInput
      ? mapKeys(style['.form-control-sm'].attributes, (_v: any, k: string) =>
          camelCase(k)
        )
      : undefined),
    ...formColor,
    '&:focus, &.cm-focused': {
      ...mapKeys(
        style['.form-control:focus'].attributes,
        (_v: any, k: string) => camelCase(k)
      ),
      ...formColor,
    },
    '&:disabled': {
      ...mapKeys(
        style['.form-control:disabled'].attributes,
        (_v: any, k: string) => camelCase(k)
      ),
      backgroundColor: isDark ? colors.gray[2] : colors.gray[8],
      color: isDark ? colors.light : colors.dark,
    },
  };
};

/** Editor */
const editor = (isDark: boolean = false) => {
  const f = form(isDark);
  // @ts-ignore
  delete f.padding;
  return {
    ...f,
    position: 'relative !important',
    boxSizing: 'border-box',
    display: 'flex !important',
    flexDirection: 'column',
  };
};

/** Button */
const button = (isDark: boolean = false) => {
  const ret = {
    ...mapKeys(style['.btn'].attributes, (_v: any, k: string) => camelCase(k)),
    ...mapKeys(
      style['.btn-group-sm>.btn,.btn-sm'].attributes,
      (_v: any, k: string) => camelCase(k)
    ),
    ...mapKeys(
      style[isDark ? '.btn-secondary' : '.btn-outline-secondary'],
      (_v: any, k: string) => camelCase(k)
    ).attributes,
    backgroundImage: 'none',
    '&:hover': {
      ...mapKeys(style['.btn:hover'].attributes, (_v: string, k: string) =>
        camelCase(k)
      ),
    },
    '&:active': {
      ...mapKeys(
        style[
          '.btn-check:checked+.btn,.btn.active,.btn.show,.btn:first-child:active,:not(.btn-check)+.btn:active'
        ].attributes,
        (_v: any, k: string) => camelCase(k)
      ),
      backgroundImage: 'none',
    },
  };
  return ret;
};

/** Label */
const label = mapKeys(
  {
    ...style['.form-check'].attributes,
    ...style['.form-check-inline'].attributes,
  },
  (_v: string, k: string) => camelCase(k)
);

/** CheckBox */
const checkbox = {
  ...mapKeys(style['.form-check-input'].attributes, (_v: string, k: string) =>
    camelCase(k)
  ),
  ...mapKeys(
    style['.form-check-input[type=checkbox]'].attributes,
    (_v: string, k: string) => camelCase(k)
  ),
  '&:active': mapKeys(
    style['.form-check-input:active'].attributes,
    (_v: string, k: string) => camelCase(k)
  ),
  '&:checked': mapKeys(
    {
      ...style['.form-check-input:checked'].attributes,
      ...style['.form-check-input:checked[type=checkbox]'].attributes,
    },
    (_v: string, k: string) => camelCase(k)
  ),
  '&:focus': mapKeys(
    style['.form-check-input:focus'].attributes,
    (_v: string, k: string) => camelCase(k)
  ),
};

/** Close Panel button */
const closeButton = {
  ...style['.btn-close'].attributes,
  color: 'transparent',
};

/** Border style */
const border = `1px solid ${colors.gray[4]}`;

export {
  closeButton,
  checkbox,
  colors,
  font,
  label,
  lineHeight,
  border,
  radius,
  button,
  editor,
  form,
};
