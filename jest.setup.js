module.exports = async () => {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  global.SQL = SQL;
};
