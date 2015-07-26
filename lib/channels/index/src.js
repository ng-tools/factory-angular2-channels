'use strict';

//
// Required modules

var path = require('path');
var combine = require('stream-combiner2');
var vfs = require('vinyl-fs');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');
var gulpif = require('gulp-if');
var match = require('gulp-match');
var merge = require('merge2');
var through = require('through2');
var File = require('vinyl');
var sort = require('sort-stream');
var _ = require('lodash');
var size = require('gulp-size');

module.exports = function(paths) {

  paths = paths ? _.defaults(paths, this.paths) : this.paths;
  var self = this, pkg = this.pkg, bower = this.bower;

  var angularLibs = [
    'node_modules/angular2/node_modules/traceur/bin/traceur-runtime.js',
    'node_modules/systemjs/dist/system.js',
    'node_modules/angular2/node_modules/reflect-metadata/Reflect.js',
    'node_modules/angular2/node_modules/zone.js/dist/zone.js',
    'node_modules/angular2/node_modules/zone.js/dist/long-stack-trace-zone.js'
  ];

  function bowerFilter(fileName) {
    fileName = fileName.replace(paths.cwd, '');
    // if((new RegExp('/' + config.pkg.name + '/')).test(fileName)) return false;
    if(bower.exclude && bower.exclude.test(fileName)) return false;
    if(bower.filter && !bower.filter.test(fileName)) return false;
    return true;
  }

  var bowerDirectory = paths.bowerDirectory || path.join(this.cwd, paths.cwd, 'bower_components');
  var bowerJson = paths.bowerJson || path.join(this.cwd, 'bower.json');

  return combine.obj(
    inject(
      merge(
        vfs.src(bowerFiles({filter: bowerFilter, paths: {bowerDirectory: bowerDirectory, bowerJson: bowerJson}}), {cwd: paths.cwd, read: false}),
        vfs.src(bower.include || '[^.]', {cwd: paths.cwd, read: false})
      ).pipe(gulpif(bower.include, sort(function(a, b) {
        if(bower.include.indexOf(path.relative(a.cwd, a.path))) return -1;
        else if(bower.include.indexOf(path.relative(b.cwd, b.path))) return 1;
        return 0;
      }))),
      {name: 'bower', addRootSlash: false}
    ),
    inject(
      merge(
        vfs.src(angularLibs, {cwd: this.cwd, base: this.cwd}),
        vfs.src('package.json', {cwd: this.cwd, base: this.cwd})
          .pipe(through.obj(function(file, enc, callback) {
            var self = this;
            var Builder = require('systemjs-builder');
            var buildConfig = {
              defaultJSExtensions: true,
              paths: {
                "angular2/*": "node_modules/angular2/es6/prod/*.js",
                "rx": "node_modules/angular2/node_modules/rx/dist/rx.js"
              },
              meta: {
                // auto-detection fails to detect properly
                'rx': {
                  format: 'cjs' //https://github.com/systemjs/builder/issues/123
                }
              }
            };
            var builder = new Builder(buildConfig);
            builder.build('angular2/angular2 + angular2/router', 'app/libraries/angular2.js', {minify: false, sourceMaps: true})
              .then(function(output) {
                // d(output.source);
                // output.source;    // generated bundle source
                // output.sourceMap; // generated bundle source map
                // output.modules;   // array of module names defined in the bundle
                self.push(new File({
                  path: 'node_modules/angular2/angular2.js',
                  contents: new Buffer(output.source)
                }));
                output.sourceMap && self.push(new File({
                  path: 'node_modules/angular2/angular2.js.map',
                  contents: new Buffer(output.sourceMap)
                }));
                callback(null);
              });
          }))
      ).pipe(vfs.dest(paths.tmp)),
      {name: 'libs', ignorePath: paths.tmp, addRootSlash: false}
    ),
    gulpif(false, inject(
      vfs.src(paths.scripts, {cwd: paths.cwd, base: self.jsPreprocessor === 'typescript' ? undefined : paths.cwd})
        .pipe(require('./../scripts/src').bind(this)()),
      {ignorePath: paths.tmp, addRootSlash: false}
    )),
    inject(
      vfs.src(paths.styles, {cwd: paths.cwd, base: paths.cwd})
        .pipe(require('./../styles/src').bind(this)()),
      {ignorePath: paths.tmp, addRootSlash: false}
    ),
    require('./../views/base').bind(this)(),
    vfs.dest(paths.tmp)
  );
};
