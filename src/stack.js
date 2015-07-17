'use strict';
let util = require('util');
let opath = require('object-path');

module.exports = {
  stack: function(state) {
    return {
      promise: new Promise(function(resolve) {
        resolve({
          state: state,

          get: function(key) {
            return opath.get(this.state, key);
          },

          set: function(key, value) {
            opath.set(this.state, key, value);
          }
        });
      }),

      then: function(fn) {
        this.promise = this.promise.then(fn);
        return this;
      },

      catch: function(fn) {
        this.promise = this.promise.catch(fn);
        return this;
      }
    };
  },

  fn: function(func) {
    return function(args) {
      if (args === undefined) {
        return func;
      }

      return function(state) {
        for (var argName in func.args) {
          if (func.args[argName].required === true && args[argName] === undefined) {
            return new Promise(function(resolve, reject) {
              reject(new Error(argName + ' argument is required.'));
            });
          }
        }

        return new Promise(function(resolve, reject) {
          function done(v) {
            if (util.isError(v)) {
              reject(v);
            } else {
              resolve(state);
            }
          }

          func.call(args, state, done);
        });
      }
    }
  }
};
