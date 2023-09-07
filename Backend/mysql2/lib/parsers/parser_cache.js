'use strict';

const LRU = require('lru-cache').default;

const parserCache = new LRU({
  max: 15000
});

function keyFromFields(type, fields, options, config) {
  let res =
    `${type}` +
    `/${typeof options.nestTables}` +
    `/${options.nestTables}` +
    `/${options.rowsAsArray}` +
    `/${options.supportBigNumbers || config.supportBigNumbers}` +
    `/${options.bigNumberStrings || config.bigNumberStrings}` +
    `/${typeof options.typeCast}` +
    `/${options.timezone || config.timezone}` +
    `/${options.decimalNumbers}` +
    `/${options.dateStrings}`;
  for (let i = 0; i < fields.length; ++i) {
    const field = fields[i];
    res += `/${field.name}:${field.columnType}:${field.length}:${field.schema}:${field.table}:${field.flags}:${field.characterSet}`;
  }
  return res;
}

function getParser(type, fields, options, config, compiler) {
  const key = keyFromFields(type, fields, options, config);
  let parser = parserCache.get(key);

  if (parser) {
    return parser;
  }

  parser = compiler(fields, options, config);
  parserCache.set(key, parser);
  return parser;
}

function setMaxCache(max) {
  parserCache.max = max;
}

function clearCache() {
  parserCache.clear();
}

module.exports = {
  getParser: getParser,
  setMaxCache: setMaxCache,
  clearCache: clearCache
};
