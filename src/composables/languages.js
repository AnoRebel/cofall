const importers = import.meta.glob("../utils/lang-code/*/index.js");
const languages = {};
Object.keys(importers).forEach(fileName => {
  const language = fileName.replace("../utils/lang-code/", "").replace("/index.js", "");
  languages[language] = importers[fileName];
});

export default languages;
