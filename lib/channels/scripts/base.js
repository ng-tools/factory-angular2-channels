'use strict';

//
// Required modules

var combine = require('stream-combiner2');
var gulpif = require('gulp-if');
var babel = require('gulp-babel');
var ts = require('gulp-typescript');
var rename = require('gulp-rename');
var through = require('through2');
var merge = require('merge2');
var StreamFromArray = require('stream-from-array');
var vfs = require('vinyl-fs');
module.exports = function() {

  // var tsProject = ts.createProject({
  //   target: 'es5',
  //   typescript: require('typescript'),
  //   module: 'commonjs',
  //   // sortOutput: true,
  //   emitDecoratorMetadata: true,
  //   declarationFiles: true,
  //   noExternalResolve: false
  // });
  // var tsFiles = [];

  return combine.obj(
    // gdebug(),
    // gulpif('**/*.ts', through.obj(function(file, encoding, next) {
    //   tsFiles.push(file);
    //   next();
    // }, function(next) {
    //   var self = this;
    //   var tsResult = StreamFromArray.obj(tsFiles).pipe(ts(tsProject));
    //   tsFiles = [];
    //   /*merge([
    //     tsResult.dts,
    //     tsResult.js
    //   ]*/
    //   tsResult.js.pipe(through.obj(function(file, encoding, _next) {
    //     self.push(file);
    //     _next();
    //   }, function(_next) {
    //     next();
    //   }));
    // })),
    // gdebug(),
    gulpif('**/*.{es6.js,es6,es}', babel(this.babel)),
    gulpif('**/*.{es6.js,es6,es,ts}', rename(function(file) { file.extname = '.js'; }))
  );
};
