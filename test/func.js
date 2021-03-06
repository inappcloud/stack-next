'use strict';
let assert = require('assert');
let test = require('mocha').test;
let stack = require('..').stack;
let fn = require('..').fn;

function eq(actual, expected, done) {
  try {
    assert.equal(actual, expected);
    done();
  } catch(e) {
    done(e);
  }
}

let func = fn({
  name: 'addOne',

  args: {
    value: {
      required: true,
      defaultsTo: 10
    }
  },

  call: function(args, state, done) {
    if (this.args.value.defaultsTo !== undefined) {
      state.ensureExists(args.value, this.args.value.defaultsTo);
    }

    state.set(args.value, state.get(args.value) + 1);
    done();
  }
});

test('call', function(done) {
  stack({ value: 1 }).then(func({ value: 'value' })).then(function(s) {
    eq(s.get('value'), 2, done);
  }).catch(function(e) {
    done(e);
  });
});

test('documentation', function(done) {
  eq(func().name, 'addOne', done);
});

test('required argument option', function(done) {
  stack({ value: 1 }).then(func({})).then(function(s) {
    done(new Error('expecting function to throw an error.'));
  }).catch(function(e) {
    eq(e.message, 'value argument is required.', done);
  });
});

test('defaultsTo argument option', function(done) {
  stack({}).then(func({ value: 'value' })).then(function(s) {
    eq(s.get('value'), 11, done);
  }).catch(function(e) {
    done(e);
  });
});
