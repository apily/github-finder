/* !
 * github-finder
 * GitHub finder
 * Copyright (c) 2012 Enrico Marino and Federico Spini
 * MIT License
 */

/**
 * Module dependencies.
 */

var request = require('superagent');
var async = require('async');
var Emitter = require('events').EventEmitter;
var join = require('path').join;

var toString = {}.toString;

module.exports = finder;

/**
 * finder
 * create a finder
 *
 * @param {Object} options options.
 *   @param {String} [client_id] GitHub application Client ID.
 *   @param {String} [client_id] GitHub application Client Secret.
 * @return {Finder} finder.
 * @api public
 */

function finder(options) {
  return new Finder(options);
}

finder.Finder = Finder;

/**
 * Finder
 * create a finder
 *
 * @param {Object} options options.
 *   @param {String} [client_id] GitHub application Client ID.
 *   @param {String} [client_id] GitHub application Client Secret.
 * @return {Finder} finder.
 * @api public
 */

function Finder(options) {
  Emitter.call(this)
  options = options || {};
  var client_id = options.client_id;
  var client_secret = options.client_secret;

  if (client_id && client_secret) {
    this.credentials = {
      client_id: client_id,
      client_secret: client_secret
    };
  }
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Finder.prototype = new Emitter;
Finder.prototype.constructor = Finder;

/**
 * open
 * open a GitHub project.
 *
 * @param {Object} options options.
 *   @param {String} user user.
 *   @param {String} project project.
 *   @param {String} [path=''] path.
 * @return {Finder} finder.
 * @api public
 */

Finder.prototype.open = function(options, callback) {
  callback = callback || function() {};
  this.get(options, function() {
    self.emit('end');
    callback();
  });
  return this;
};

/**
 * get
 * Get a directory or a file
 *
 * @param {Object} options options.
 *   @param {String} user user.
 *   @param {String} project project.
 *   @param {String} [path=''] path.
 * @param {Function} callback callback.
 *   @param {Object} err error.
 *   @param {Object} data directory info.
 * @api public
 */

Finder.prototype.get = function(options, callback) {
  var self = this;
  var user = options.user;
  var project = options.project;
  var path = options.path;
  var fullpath = join(user, project, 'contents', path);
  var url = 'https://api.github.com/repos/' + fullpath;
  var query = {};

  if (this.credentials) {
    query = this.credentials;
  }

  request
    .get(url)
    .query(query)
    .end(function(err, res) {
      if (err) {
        throw err;
      }

      self.read(options, res, callback);
    });
};

/**
 * read
 * Read the item
 *
 * @param {Object} options options.
 *   @param {String} user user.
 *   @param {String} project project.
 *   @param {String} [path=''] path.
 * @param {Object} item file or directory.
 * @param {Function} callback callback.
 *   @param {Object} err error.
 * @api public
 */

Finder.prototype.read = function(options, item, callback) {
  var is_dir = '[object Array]' === toString.call(item);

  if (is_dir) {
    this.emit('dir', item);
    this.readdir(options, item, callback);
    return;
  }

  this.emit('file', item);
  callback();
};

/**
 * readdir
 * Read directory information
 *
 * @param {Object} options options.
 *   @param {String} user user.
 *   @param {String} project project.
 *   @param {String} [path=''] path.
 * @param {Array} dir directory info.
 * @param {Function} callback callback.
 *   @param {Object} err error object.
 *   @param {Object} obj the object of parsed files.
 */

Finder.prototype.readdir = function(options, dir, callback) {
  var self = this;

  async.forEach(dir, function(item, callback) {
    var options = {
      user: options.user,
      project: options.project,
      path: item.path
    };
    self.get(options, callback);
  }, callback);
};
