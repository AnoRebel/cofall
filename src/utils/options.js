const modeOptions = [
  { value: "haskell-literate", label: "Haskell-Literate" },
  { value: "mscgen", label: "Mscgen" },
  { value: "groovy", label: "Groovy" },
  { value: "smarty", label: "Smarty" },
  { value: "jsx", label: "Jsx" },
  { value: "vue", label: "Vue" },
  { value: "htmlembedded", label: "HtmlEmbedded" },
  { value: "pascal", label: "Pascal" },
  { value: "css", label: "Css" },
  { value: "perl", label: "Perl" },
  { value: "puppet", label: "Puppet" },
  { value: "markdown", label: "Markdown" },
  { value: "erlang", label: "Erlang" },
  { value: "shell", label: "Shell" },
  { value: "nginx", label: "Nginx" },
  { value: "sql", label: "Sql" },
  { value: "rpm", label: "Rpm" },
  { value: "yaml-frontmatter", label: "Yaml-Frontmatter" },
  { value: "go", label: "Go" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "ecl", label: "Ecl" },
  { value: "d", label: "D" },
  { value: "dart", label: "Dart" },
  { value: "ruby", label: "Ruby" },
  { value: "mirc", label: "Mirc" },
  { value: "haml", label: "Haml" },
  { value: "haxe", label: "Haxe" },
  { value: "protobuf", label: "Protobuf" },
  { value: "idl", label: "Idl" },
  { value: "tornado", label: "Tornado" },
  { value: "q", label: "Q" },
  { value: "commonlisp", label: "CommonLisp" },
  { value: "gas", label: "Gas" },
  { value: "asn.1", label: "Asn.1" },
  { value: "toml", label: "Toml" },
  { value: "rust", label: "Rust" },
  { value: "apl", label: "Apl" },
  { value: "verilog", label: "Verilog" },
  { value: "django", label: "Django" },
  { value: "coffeescript", label: "CoffeeScript" },
  { value: "swift", label: "Swift" },
  { value: "yaml", label: "Yaml" },
  { value: "htmlmixed", label: "HtmlMixed" },
  { value: "asterisk", label: "Asterisk" },
  { value: "php", label: "Php" },
  { value: "scheme", label: "Scheme" },
  { value: "turtle", label: "Turtle" },
  { value: "gfm", label: "Gfm" },
  { value: "sieve", label: "Sieve" },
  { value: "lua", label: "Lua" },
  { value: "cobol", label: "Cobol" },
  { value: "elm", label: "Elm" },
  { value: "julia", label: "Julia" },
  { value: "smalltalk", label: "SmallTalk" },
  { value: "diff", label: "Diff" },
  { value: "octave", label: "Octave" },
  { value: "solr", label: "Solr" },
  { value: "xml", label: "Xml" },
  { value: "clojure", label: "Clojure" },
  { value: "sas", label: "Sas" },
  { value: "twig", label: "Twig" },
  { value: "vb", label: "Vb" },
  { value: "eiffel", label: "Eiffel" },
  { value: "jinja2", label: "Jinja2" },
  { value: "http", label: "Http" },
  { value: "fcl", label: "Fcl" },
  { value: "mathematica", label: "Mathematica" },
  { value: "sass", label: "Sass" },
  { value: "stylus", label: "Stylus" },
  { value: "livescript", label: "LiveScript" },
  { value: "properties", label: "Properties" },
  { value: "slim", label: "Slim" },
  { value: "pug", label: "Pug" },
  { value: "r", label: "R" },
  { value: "javascript", label: "Javascript" },
  { value: "spreadsheet", label: "SpreadSheet" },
  { value: "asciiarmor", label: "AsciiArmor" },
  { value: "tcl", label: "Tcl" },
  { value: "haskell", label: "Haskell" },
  { value: "vhdl", label: "Vhdl" },
  { value: "vbscript", label: "VbScript" },
  { value: "handlebars", label: "HandleBars" },
  { value: "textile", label: "Textile" },
  { value: "nsis", label: "Nsis" },
  { value: "powershell", label: "Powershell" },
  { value: "python", label: "Python" },
  { value: "dtd", label: "Dtd" },
  { value: "brainfuck", label: "Brainfuck" },
  { value: "pig", label: "Pig" },
  { value: "rst", label: "Rst" },
  { value: "pegjs", label: "Pegjs" },
  { value: "xquery", label: "Xquery" },
  { value: "cmake", label: "Cmake" },
  { value: "fortran", label: "Fortran" },
];

const fileExts = {
  "haskell-literate": "hs",
  mscgen: "msc",
  groovy: "groovy",
  smarty: "smarty",
  jsx: "jsx",
  vue: "vue",
  htmlembedded: "html",
  pascal: "pascal",
  css: "css",
  perl: "pl",
  markdown: "md",
  erlang: "erl",
  shell: "sh",
  nginx: "",
  sql: "sql",
  rpm: "rpm",
  "yaml-frontmatter": "yaml",
  go: "go",
  dockerfile: "",
  ecl: "ecl",
  d: "d",
  dart: "dart",
  ruby: "rb",
  mirc: "mrc",
  haml: "haml",
  haxe: "hx",
  protobuf: "proto",
  idl: "idl",
  tornado: "py",
  q: "q",
  commonlisp: "gcl",
  toml: "toml",
  rust: "rs",
  apl: "apl",
  verilog: "v",
  django: "py",
  coffeescript: "coffee",
  swift: "swift",
  yaml: "yaml",
  htmlmixed: "html",
  php: "php",
  scheme: "ss",
  turtle: "py",
  gfm: "gfm",
  sieve: "sieve",
  lua: "lua",
  cobol: "cobol",
  elm: "elm",
  julia: "jl",
  smalltalk: "st",
  diff: "diff",
  octave: "oct",
  xml: "xml",
  clojure: "clj",
  sas: "sas",
  twig: "twig",
  vb: "vb",
  jinja2: "jinja2",
  http: "http",
  fcl: "fcl",
  sass: "sass",
  stylus: "styl",
  livescript: "js",
  properties: "props",
  pug: "pug",
  r: "r",
  javascript: "js",
  spreadsheet: "xlsx",
  tcl: "tcl",
  haskell: "hs",
  vbscript: "vbs",
  handlebars: "hbs",
  textile: "textile",
  powershell: "ps",
  python: "py",
  dtd: "dtd",
  brainfuck: "bf",
  rst: "rst",
  pegjs: "peg",
  cmake: "make",
  fortran: "f",
};

export { modeOptions, themeOptions, fileExts };
