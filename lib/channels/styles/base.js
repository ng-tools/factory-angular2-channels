'use strict';

//
// Required modules

var combine = require('stream-combiner2');
var gulpif = require('gulp-if');
var less = require('gulp-less');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');

module.exports = function() {
  var config = this;
  return combine.obj(
    gulpif('**/*.less', less(config.less)),
    gulpif('**/*.{sass,scss}', sass(config.sass)),
    autoprefixer('last 1 version')
  );
};
