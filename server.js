var fallback = require('express-history-api-fallback');
var express = require('express');
var app = express();
var madge = require('madge');
require('sugar');

app.get('/api/config', function (req, res) {
  var result = {
    credentials: {
      google: {
        analytics: 'UA-74965434-1'
      }
    }
  };
  res.send(result);
});

app.get('/api/file', function (req, res) {
  walk('.', function (err, files) {
    if (err) throw err;
    // TODO: modify this list of top-level folders to scan files for when needed
    var allowedFilesRegex = /^\.\/((app)|(component)|(framework)|(lib)|(lib-ext)|(locale)|(nls)|(util)|(widget))\//i;
    var notAllowedFilesRegex = /^(\.|_)/;
    res.send((files.remove(function (file) {
      var parts = file.split('/');
      if (notAllowedFilesRegex.test(parts[parts.length - 1])) return true;
      if (parts.length === 2) return false;
      return !allowedFilesRegex.test(file);
    }).map(function (file) { return file.remove(/^\.\//) })));
  });
});

app.get('/api/file/dependencies', function (req, res) {
  res.send(madge('.', {
    exclude: 'node_modules\/|^build',
    format: 'amd',
    requireConfig: './common.js',
    findNestedDependencies: true
  }).tree);
});

var root = __dirname;
app.use(express.static(root));
app.use(fallback('index.html', { root: root }));
var port = process.env.PORT || 8080;
app.listen(port);
console.log('Visit http://localhost:' + port + ' to see the app.');

var fs = require('fs');
function walk(dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
}
