'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseRules = parseRules;
exports.callRule = callRule;
exports.getInvalidMessage = getInvalidMessage;
exports.toggleMessageElement = toggleMessageElement;
exports.toggleInvalidClass = toggleInvalidClass;
exports.isBlank = isBlank;
exports.testRegex = testRegex;
exports.numeric = numeric;
exports.size = size;

var _rules = require('./rules');

/**
 * Rules parse func
 *
 * Accept: @Function, @String, @Array
 */
function parseRules(rules) {
  if (typeof rules === 'function') {
    return [rules];
  }if (Array.isArray(rules)) {
    return rules;
  }if (typeof rules === 'string') {
    return rules.split(',');
  }
  throw TypeError('Invalid type of prop \'rules\'');
}

/**
 * Rule call func
 * Accept rule from user's rules Array
 *
 * Accept: @String, @Function
 */
function callRule(rule, value) {
  if (typeof rule === 'string') {
    if (!(rule in _rules.rules)) {
      throw TypeError('Rule doesn\'t exist in default rules object');
    } else {
      return _rules.rules[rule].rule(value);
    }
  } else if (typeof rule === 'function') {
    return rule(value);
  } else {
    throw TypeError('Rule type not supported');
  }
}

/**
 * Returned invalid message
 */
function getInvalidMessage(message, rule) {
  var rules = this.rules;
  if (message) {
    return message;
  }if (!message && rules[rule]) {
    return rules[rule].message;
  }
  return rules.default.message;
}

/**
 * Create error element
 */
function toggleMessageElement(error, className, messageEl) {
  var element = messageEl || document.createElement('div');
  if (!messageEl) {
    element.classList.add(className);
  }
  element.innerText = error;
  return element;
}

function toggleInvalidClass(wrapper, val, className) {
  wrapper.classList[val ? 'add' : 'remove'](className);
}

function isBlank(value) {
  return typeof value === 'undefined' || value === null || value === '';
}

function testRegex(value, regex) {
  return value.toString().match(regex) !== null;
}

function numeric(val) {
  return this.testRegex(val, /^(\d+.?\d*)?$/);
}

function size(val, type) {
  // if an array or string get the length, else return the value.
  if (type === 'string' || type === undefined || type === 'array') {
    return val.length;
  }if (type === 'num') {
    return parseFloat(val);
  }
  return false;
}