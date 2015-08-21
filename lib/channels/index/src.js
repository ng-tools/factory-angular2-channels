'use strict';

//
// Required modules

var combine = require('stream-combiner2');
var vfs = require('vinyl-fs');
var inject = require('gulp-inject');
var merge = require('merge2');
var _ = require('lodash');
var gulpif = require('gulp-if');
var chalk = require('chalk');

module.exports = function(paths) {

  paths = paths ? _.defaults(paths, this.paths) : this.paths;
  var self = this, pkg = this.pkg, bower = this.bower;

  return combine.obj(
    inject(
      require('./helpers/bower').bind(this)(paths, {minify: false}),
      {name: 'bower', addRootSlash: false}
    ),
    inject(
      require('./helpers/angular').bind(this)(paths, {minify: false, sourceMaps: true})
        .pipe(vfs.dest(paths.tmp)),
      {name: 'angular', ignorePath: paths.tmp, addRootSlash: false}
    ),
    inject(
      vfs.src(paths.styles, {cwd: paths.cwd, base: paths.cwd})
        .pipe(require('./../styles/src').bind(this)())
        .on('error', errorHandler),
      {ignorePath: paths.tmp, addRootSlash: false}
    ),
    gulpif(false, inject(
      vfs.src(paths.scripts, {cwd: paths.cwd, base: paths.cwd})
        .pipe(require('./../scripts/src').bind(this)())
        .on('error', errorHandler),
      {ignorePath: paths.tmp, addRootSlash: false}
    )),
    require('./../views/base').bind(this)(),
    vfs.dest(paths.tmp)
  );

};

function errorHandler(err) {
  console.log('[' + chalk.grey(new Date().toLocaleTimeString()) + '] ' + err.toString() + (err.stack ? '\n' + err.stack : ''));
  console.log('[' + chalk.grey(new Date().toLocaleTimeString()) + '] ' + chalk.red('An error occured while processing the index inject tasks, some files may have not been properly processed.'));
}
