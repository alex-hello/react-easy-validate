'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rules = undefined;

var _helpers = require('./helpers');

var rules = exports.rules = {
  accepted: { message: 'Field must be accepted.', rule: function rule(val) {
      return val === true;
    }, required: true },
  alpha: {
    message: 'Field may only contain letters.',
    rule: function rule(val) {
      return (0, _helpers.testRegex)(val, /^[A-Z]*$/i);
    }
  },
  alpha_space: {
    message: 'Field may only contain letters and spaces.',
    rule: function rule(val) {
      return (0, _helpers.testRegex)(val, /^[A-Z\s]*$/i);
    }
  },
  alpha_num: {
    message: 'Field may only contain letters and numbers.',
    rule: function rule(val) {
      return (0, _helpers.testRegex)(val, /^[A-Z0-9]*$/i);
    }
  },
  alpha_num_space: {
    message: 'Field may only contain letters, numbers, and spaces.',
    rule: function rule(val) {
      return (0, _helpers.testRegex)(val, /^[A-Z0-9\s]*$/i);
    }
  },
  alpha_num_dash: {
    message: 'Field may only contain letters, numbers, and dashes.',
    rule: function rule(val) {
      return (0, _helpers.testRegex)(val, /^[A-Z0-9_-]*$/i);
    }
  },
  alpha_num_dash_space: {
    message: 'Field may only contain letters, numbers, dashes, and spaces.',
    rule: function rule(val) {
      return (0, _helpers.testRegex)(val, /^[A-Z0-9_-\s]*$/i);
    }
  },
  array: {
    message: 'Field must be an array.',
    rule: function rule(val) {
      return Array.isArray(val);
    }
  },
  boolean: {
    message: 'Field must be a boolean.',
    rule: function rule(val) {
      return val === false || val === true;
    }
  },
  email: {
    message: 'Field must be a valid email address.',
    rule: function rule(val) {
      return (0, _helpers.testRegex)(val, /^[A-Z0-9.!#$%&'*+-/=?^`{|}~]+@[A-Z0-9.-]+.[A-Z]{2,}$/i);
    }
  },
  numeric: {
    message: 'Field must be a number.',
    rule: function rule(val) {
      return (0, _helpers.numeric)(val);
    }
  },
  required: {
    message: 'Field is required.',
    rule: function rule(val) {
      return !(0, _helpers.isBlank)(val);
    }
  },
  url: {
    message: 'Field must be a url.',
    // eslint-disable-next-line
    rule: function rule(val) {
      return (0, _helpers.testRegex)(val, /^(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?$/i);
    }
  },
  default: {
    message: 'Field is invalid'
  }
};