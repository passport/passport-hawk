/**
 * Module dependencies.
 */
var passport = require('passport')
  , util = require('util')
  , hawk = require('hawk');

var xtend = require('xtend');

/**
 * `Strategy` constructor.
 *
 * The HTTP Hawk authentication strategy authenticates requests based on
 * a bearer token contained in the `Authorization` header field or 
 * `hawk` query parameter.
 *
 * Applications must supply a `verify` callback which accepts an `id` and
 * then calls the `done` callback supplying a `credentials` object which 
 * should contains a `key` property matching the MAC, an `algorithm` 
 * property and a `user` property. 
 * If the user is not valid return false
 * `false` as the user.
 * 
 * Examples:
 *
 *     passport.use(new HawkStrategy(
 *       function(id, done) {
 *         User.findById({ _id: id }, function (err, user) {
 *           if (err) { return done(err); }
 *           if (!user) { return done(null, false); }
 *           return done(null, user);
 *         });
 *       }
 *     ));
 *
 * @param {Function} verify
 * @api public
 */
function Strategy(bewit, verify) {
  if(typeof bewit == 'function'){
    verify = bewit;
    bewit = false;
  }
  if(typeof bewit == 'object'){
    bewit = bewit.bewit;
  }
  console.log('bewit', bewit);
  if (!verify) throw new Error('HTTP Hawk authentication strategy requires a verify function');
  this.verify = verify;
  this.bewit = bewit;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a HTTP Hawk authorization
 * header or query string parameter.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
  //express change req.url when mounting with app.use
  //this creates a new request object with url = originalUrl
  req = xtend({}, req, { url: req.originalUrl || req.url });
  
  if(this.bewit){
    hawk.uri.authenticate(req, this.verify, {}, function (err, credentials, ext) {
      if (err && err.message === 'Missing credentials') return this.fail('invalid_token');
      if (err && err.message) return this.fail(err.message);
      if (err) return this.error(err);
      this.success(credentials.user, ext);
    }.bind(this));
  }else{
    hawk.authenticate(req, this.verify, {}, function (err, credentials, ext) {
      if (err && err.message === 'Missing credentials') return this.fail('invalid_token');
      if (err && err.message) return this.fail(err.message);
      if (err) return this.error(err);
      this.success(credentials.user, ext);
    }.bind(this));
  }
};

/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;
