import { SqlJsStatic } from 'sql.js';

declare global {
  // eslint-disable-next-line no-var
  var SQL: SqlJsStatic;
}

export {};
