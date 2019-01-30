import {rules, messages} from './';

/**
 * Rules parse func
 *
 * Accept: @Function, @String, @Array
 */
export function parseRules(rules) {
    if (typeof rules === 'function') {
        return [rules];
    } else if (Array.isArray(rules)) {
        return rules;
    } else if (typeof rules === 'string') {
        return rules.split(',');
    } else {
        throw TypeError(`Invalid type of prop 'rules'`);
    }
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
            throw TypeError(`Rule doesn't exist in default rules object`);
        } else {
            return rules[rule](value);
        }
    } else if (typeof rule === 'function') {
        return rule(value);
    } else {
        throw TypeError(`Rule type not supported`);
    }
}

/**
 * Returned invalid message
 */
export function getInvalidMessage(message, rule) {
    if (message) {
        return message;
    } else if (!message && messages[rule]) {
        return messages[rule]();
    } else {
        return messages.default();
    }
}

/**
 * Create error element
 */
export function toggleMessageElement(error, className, messageEl) {
    let element = messageEl || document.createElement('div');
    if (!messageEl) {
        element.classList.add(className);
    }
    element.innerText = error;
    return element;
}


export function toggleInvalidClass(wrapper, val, className) {
    wrapper.classList[val ? 'add' : 'remove'](className);
}
