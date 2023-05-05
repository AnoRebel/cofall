import { sql, PostgreSQL } from "@codemirror/lang-sql";

export default {
  language: () => sql({ dialect: PostgreSQL }),
};
