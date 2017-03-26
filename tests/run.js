'use strict';

const fs = require('fs');
const ts = require('typescript');
const Mocha = require('mocha');
const glob = require('glob');
const path = require('path');

require.extensions['.ts'] = function(m, filename) {
  const source = fs.readFileSync(filename).toString();

  try {
    const result = ts.transpile(source, {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJs
    });

    return m._compile(result, filename);
  } catch (err) {
    console.error('Error while running script "' + filename + '":');
    console.error(err.stack);
    throw err;
  }
};

const specFiles = glob.sync(path.resolve(__dirname, '../tests/unit/**/*.spec.*'));
const mocha = new Mocha({ timeout: 5000, reporter: 'spec' });

specFiles.forEach(file => mocha.addFile(file));

mocha.run(failures => {
  process.on('exit', () => process.exit(failures));
});
