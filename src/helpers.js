import { rules } from './rules';

/**
 * Rules parse func
 *
 * Accept: @Function, @String, @Array
 */
export function parseRules(rules) {
  if (typeof rules === 'function') {
    return [rules];
  } if (Array.isArray(rules)) {
    return rules;
  } if (typeof rules === 'string') {
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
export function callRule(rule, value) {
  if (typeof rule === 'string') {
    if (!(rule in rules)) {
      throw TypeError('Rule doesn\'t exist in default rules object');
    } else {
      return rules[rule].rule(value);
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
export function getInvalidMessage(message, rule) {
  const rules = this.rules;
  if (message) {
    return message;
  } if (!message && rules[rule]) {
    return rules[rule].message;
  }
  return rules.default.message;
}

/**
 * Create error element
 */
export function toggleMessageElement(error, className, messageEl) {
  const element = messageEl || document.createElement('div');
  if (!messageEl) {
    element.classList.add(className);
  }
  element.innerText = error;
  return element;
}


export function toggleInvalidClass(wrapper, val, className) {
  wrapper.classList[val ? 'add' : 'remove'](className);
}

export function isBlank(value) {
  return typeof (value) === 'undefined' || value === null || value === '';
}

export function testRegex(value, regex) {
  return value.toString().match(regex) !== null;
}

export function numeric(val) {
  return this.testRegex(val, /^(\d+.?\d*)?$/);
}
