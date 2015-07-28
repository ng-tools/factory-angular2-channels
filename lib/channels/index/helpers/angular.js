'use strict';

//
// Required modules

var _ = require('lodash');
var chalk = require('chalk');
var File = require('vinyl');
var fs = require('fs');
var log = require('./../../../utils/log');
var merge = require('merge2');
var path = require('path');
var through = require('through2');
var vfs = require('vinyl-fs');

module.exports = function(paths, buildConfig) {
  paths = paths ? _.defaults(paths, this.paths) : this.paths;
  var self = this, pkg = this.pkg;

  var angular = {
    target: 'node_modules/angular2/build',
    build: {
      defaultJSExtensions: true,
      paths: {
        'angular2/*': './node_modules/angular2/es6/prod/*.js',
        'rx': './node_modules/angular2/node_modules/rx/dist/rx.js'
      },
      meta: {
        'rx': {
          format: 'cjs' //https://github.com/systemjs/builder/issues/123
        }
      }
    },
    modules: [
      'router'
    ],
    libs: [
      'node_modules/angular2/node_modules/traceur/bin/traceur-runtime.js',
      'node_modules/systemjs/dist/system.js',
      'node_modules/angular2/node_modules/reflect-metadata/Reflect.js',
      'node_modules/angular2/node_modules/zone.js/dist/zone.js',
      'node_modules/angular2/node_modules/zone.js/dist/long-stack-trace-zone.js'
    ]
  };

  return merge(
    vfs.src(angular.libs, {cwd: this.cwd, base: this.cwd}),
    vfs.src('node_modules/angular2/angular2.js', {cwd: this.cwd, base: this.cwd})
      .pipe(through.obj(function(file, enc, next) {
        var stream = this;
        var buildFilePath = path.join(angular.target, 'angular2' + (buildConfig.minify ? '.min.js' : '.js'));
        // First let's try to locate a previous angular2 build
        try {
          if (fs.statSync(path.join(self.cwd, buildFilePath))) {
            log('Building \'' + chalk.cyan('angular2') + '\' skipped, found existing build in ' + chalk.magenta(buildFilePath));
            stream.push(new File({
              path: buildFilePath,
              contents: new Buffer(fs.readFileSync(path.join(self.cwd, buildFilePath)))
            }));
            fs.statSync(path.join(self.cwd, buildFilePath + '.map')) && stream.push(new File({
              path: buildFilePath + '.map',
              contents: new Buffer(fs.readFileSync(path.join(self.cwd, buildFilePath + '.map')))
            }));
            next(null);
            return;
          }
        } catch(err) {
          // Nothing
        }
        log('Building \'' + chalk.cyan('angular2') + '\' into ' + chalk.magenta(buildFilePath) + '...');
        var started = Date.now();
        var Builder = require('systemjs-builder');
        var builder = new Builder(angular.build);
        builder.build(listAngularModules(angular.modules), buildFilePath, buildConfig)
          .then(function(output) {
            log('Built \'' + chalk.cyan('angular2') + '\' into ' + chalk.magenta(buildFilePath) + ' after ' + chalk.magenta(Math.ceil((Date.now() - started) / 1000) + ' s'));
            stream.push(new File({
              path: buildFilePath,
              contents: new Buffer(output.source)
            }));
            output.sourceMap && stream.push(new File({
              path: buildFilePath + '.map',
              contents: new Buffer(output.sourceMap)
            }));
            next(null);
          })
          .catch(next);
      }))
  );
};

// Private helpers

var prefixWithAngularModule = _.partialRight(_.map, function(value) {
  return 'angular2/' + value;
});

function listAngularModules(modules) {
  return prefixWithAngularModule(['angular2'].concat(modules)).join(' + ');
}


/*    inject(
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
            builder.build('angular2/angular2 + angular2/router', 'app/libraries/angular2.min.js', {minify: true, sourceMaps: true})
              .then(function(output) {
                self.push(new File({
                  path: 'node_modules/angular2/angular2.min.js',
                  contents: new Buffer(output.source)
                }));
                output.sourceMap && self.push(new File({
                  path: 'node_modules/angular2/angular2.min.js.map',
                  contents: new Buffer(output.sourceMap)
                }));
                callback(null);
              });
          }))
      ).pipe(size({showFiles: true, gzip: true})).pipe(vfs.dest(paths.dest)),
      {name: 'libs', ignorePath: paths.dest, addRootSlash: false}
    ),*/
