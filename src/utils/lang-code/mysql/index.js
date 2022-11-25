import { sql, MySQL } from '@codemirror/lang-sql'

export default {
  language: () => sql({ dialect: MySQL })
}
