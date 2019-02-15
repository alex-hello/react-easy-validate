import {
  parseRules, callRule, getInvalidMessage, toggleMessageElement, toggleInvalidClass,
} from './helpers';
import { rules as globalRules } from './rules';

const ELEMENT_DEEP_SIZE = 10;
const WRAPPER_CLASS = 'form-group';
const ERROR_MESSAGE_CLASS = 'validation-error-message';
const ERROR_CLASS = 'validation-error';

/**
 * @class Validate Construct new validation instance
 */
export class Validate {
  /**
     * @function constructor
     * @param {Object} props - List of properties :required
     * @param {Object} props.fields - List of fields for validation :required
     * @param {String} props.fields.name - Name of validation element passed by object key
     * @param {String} props.fields[name].message - Default message for all errors of validation in this field
     * @param {String} props.fields[name].ref - Custom field name if u use findAllByRefs and wouldn't like default elementRef
     * @param {String} props.fields[name].field - It's name of param in your state for get value. For default uses name of validation
     * @param {Object} props.scope - React component's instance :required
     * @param {Object} props.scope.validationNode - node for select elements of validation and show error :required if u use createErrorElement
     * @param {Object} props.element - alternative for validationNode, but you must call Validate after component mounted
     * @param {Object} props.createErrorElement - prop that need if u use validate by DOM or validate by Refs
     * @param {Object | String} [props.createErrorElement.wrapperClass=form-group] - className of wrapper that will be selected for append error els for each input
     * @param {Object | String} [props.createErrorElement.errorClass=validation-error] - className of error that will be add to wrapperClass
     * @param {Object | String} [props.createErrorElement.errorMessageClass=validation-error-message] - className of message block that will append to el with wrapperClass
     * @param {Object} props.rules - list of your custom rules for validation
     */
  constructor({
    fields, scope, element, createErrorElement, rules,
  }) {
    this.fields = fields || {};
    this.scope = scope;
    if (createErrorElement !== undefined) {
      this.createErrorElement = Object.prototype.toString.call(createErrorElement) === '[object Object]' ? createErrorElement : {};
    }
    this.rules = {
      ...globalRules,
      ...rules,
    };
    if (this.createErrorElement) {
      this.$el = scope.validationNode || element;
      if (!this.createErrorElement.wrapperClass) this.createErrorElement.wrapperClass = WRAPPER_CLASS;
      if (!this.createErrorElement.errorClass) this.createErrorElement.errorClass = ERROR_CLASS;
      if (!this.createErrorElement.errorMessageClass) this.createErrorElement.errorMessageClass = ERROR_MESSAGE_CLASS;
    }
    if (!this.fields) {
      throw TypeError('fields important to use createErrorElement');
    }
    this.validateFieldStore = new Map();
  }

  /**
     * @function validateField - function for validation if u use findAllByRefs or findAllByDom
     * @param {Object} element - DOM element for validation
     * @param {Object} [validation=this.fields[element.name].rules] Property for passing validation settings
     */

  validateField(element, validation = this.fields[element.name].rules) {
    const value = element.value;
    const saved = this.validateFieldStore.get(element);
    let invalid = false;


    let messageEl;


    let firstError;


    let wrapper;
    if (this.createErrorElement) {
      if (saved) {
        wrapper = saved.wrapper;
        messageEl = saved.messageEl;
      }
      const inputRulesArr = parseRules(validation);
      for (const rule of inputRulesArr) {
        const result = callRule(rule, value);
        if (!result || typeof result === 'string') {
          invalid = true;
          firstError = getInvalidMessage.call(this, result || validation.message, rule);
          if (saved) {
            wrapper = saved.wrapper;
            messageEl = toggleMessageElement(firstError, this.createErrorElement.errorMessageClass, saved.messageEl);
          } else {
            wrapper = findWrapper.call(this, element);
            messageEl = toggleMessageElement(firstError, this.createErrorElement.errorMessageClass);
          }
          this.validateFieldStore.set(element, {
            firstError,
            messageEl,
            wrapper,
            rule,
          });
          if (!wrapper.contains(messageEl)) {
            wrapper.appendChild(messageEl);
          }
          break;
        }
      }
      if (wrapper) {
        toggleInvalidClass(wrapper, invalid);
      }
      if (!invalid && wrapper && wrapper.contains(messageEl)) {
        wrapper.removeChild(messageEl);
      }
    } else {
      invalid = Boolean(this.check(element.name, true, validation, element.value));
      findFieldIn(element.name, this.fields).showError = invalid;
      this.scope.forceUpdate();
    }
    return invalid;
  }

  /**
     * @function validateAll - Validate all method support 3 scenarios:
     * DOM Scenario: By react-dom find component's el and find fields by query-selector (Are you sure that found element will be the element that you need?)
     * REF Scenario: By refs (it's priority variant, because it's guarantees stability and does not confuse nodes)
     * Validate by curved braces in render func
     * @param {Array} fields - Custom fields for validation
     */
  validateAll(fields) {
    if (this.createErrorElement) {
      const cmpEl = this.$el || this.scope.validationNode;
      if (fields) {
        return fields.map(key => validateAllWithCreatingErrorEl.call(this, key, cmpEl)).some(el => el === true);
      }
      return Object.keys(this.fields)
        .map(key => validateAllWithCreatingErrorEl.call(this, key, cmpEl))
        .some(el => el === true);
    }
    return validateSimple.call(this, fields);
  }

  /**
     * @function check - Field in validation object with rules and etc
     * @param: {String} validateField - field that must be validate in this.fields
     * @param: {String, Function} validation - Property for passing validation settings
     * */
  check(validateField, showError, validation, value) {
    const fieldObj = findFieldIn(validateField, this.fields);
    const scopedField = value || findFieldIn(fieldObj.field || validateField, this.scope.state);
    if (fieldObj.invalid === undefined) initValidationObj(fieldObj);
    const validationRules = validation || this.fields[validateField].rules;
    let invalid = false;
    let firstError;
    if (!validationRules) throw TypeError('Validation rules doesn\'t exist in params and fields');
    const rulesArr = parseRules(validationRules);
    for (const rule of rulesArr) {
      const result = callRule(rule, scopedField);
      if (!result || typeof result === 'string') {
        invalid = true;
        firstError = getInvalidMessage.call(this, result || fieldObj.message, rule);
        break;
      }
    }
    fieldObj.invalid = invalid;
    return (firstError && (fieldObj.showError || showError)) ? firstError : '';
  }

  /**
     * @function isInvalid - check field for valid value in state
     * @param: {String} field - field that must be validate in this.fields
     * */
  isInvalid(field) {
    return this.fields[field].invalid && this.fields[field].showError;
  }
}
/**
 * @function findFieldIn - support function wrapper for findDeepField
 * @param {String} field - name of field, supports 'field.inner.inner.inner'
 * @param {Object} where - object where u will search field
 */
function findFieldIn(field, where) {
  const parsedField = field.split('.');
  if (parsedField.length > 1) {
    return findDeepField(parsedField, where);
  }
  return where[field];
}

/**
 * @function initValidationObj - Helper for create validation obj props
 * @param {Object} obj - Object of validation
 */
function initValidationObj(obj) {
  obj.invalid = false;
  obj.showError = false;
}

/**
 * @function initValidationObj - helper for search property in object
 * @param {Array} field - List of inner params
 * @param {Object} where - Object where u will search field
 */
function findDeepField(field, where) {
  let find = where;
  while (field.length) {
    find = find[field[0]];
    if (find === undefined) throw TypeError('Passed fields doesn\'t exist in state');
    field.splice(0, 1);
  }
  return find;
}


/**
 * @function findWrapper - Find wrapper of current element for adding error class and validation error message
 *
 * @param {Object} element - element of DOM. Parent of this element we will find
 * */
function findWrapper(element) {
  let toggleElement = element.classList.contains(this.createErrorElement.wrapperClass) ? element : null;
  let deepCounter = ELEMENT_DEEP_SIZE;
  while (!toggleElement && deepCounter > 0) {
    element = element.parentNode;
    if (element.classList.contains(this.createErrorElement.wrapperClass)) {
      toggleElement = element;
      break;
    }
    --deepCounter;
  }
  if (!toggleElement) {
    console.warn('Element for adding error not found');
    return false;
  }
  return element;
}

// Scenarios

/**
 * @function validateAllWithCreatingErrorEl - Wrapper for findAllByRefs and findAllByDom
 * @param {String} key - name of validation prop
 * @param {Object} cmpEl - DOM element of validation wrapper
 */
function validateAllWithCreatingErrorEl(key, cmpEl) {
  if (this.createErrorElement.findAllByRefs) {
    return validateAllRefScenario.call(this, key);
  }
  if (!cmpEl) throw TypeError('Component\'s el doesn\'t exist');
  return validateAllDomScenario.call(this, key, cmpEl);
}

/**
 * @function validateSimple - scenario for validate all fields in this.fields or passed fields
 * @param {String} fields - Custom fields for validation
 */
function validateSimple(fields) {
  let hasError = false;
  (fields || Object.keys(this.fields)).forEach((validateField) => {
    const fieldObj = this.fields[validateField];
    const scopedField = this.scope.state[validateField];
    let invalid = false;
    if (fieldObj.invalid === undefined) initValidationObj(fieldObj);
    const rulesArr = parseRules(fieldObj.rules);
    for (const rule of rulesArr) {
      const result = callRule(rule, scopedField);
      if (!result || typeof result === 'string') {
        invalid = true;
        hasError = invalid;
        fieldObj.invalid = invalid;
        fieldObj.showError = true;
        break;
      }
    }
  });
  this.scope.forceUpdate();
  return hasError;
}
/**
 * @function validateAllDomScenario - Find in Component's Dom element for validate and show error
 * It can use callback in field.domSelector if you want to add custom selector for current validation field
 * It can use callback in findAllByDom.domSelector if you want to add custom selector for current component
 * By default selector search input with name = validation field name
 *
 * @param {String} key - name of validation prop
 * @param {Object} cmpEl - DOM element of validation wrapper
 * */
function validateAllDomScenario(key, cmpEl) {
  let invalid = false;
  const field = this.fields[key];
  let node;
  if (field.domSelector) {
    node = field.domSelector(key, this.scope);
  } else if (this.scope.findAllByDom && this.scope.findAllByDom.domSelector) {
    node = this.scope.findAllByDom.domSelector(this.scope, key);
  } else {
    node = cmpEl.querySelector(`input[name=${key}]`);
  }
  if (!node) throw TypeError(`Node in field '${key}' not found`);
  const result = this.validateField(node);
  if (result) invalid = true;
  return invalid;
}

/**
 * @function validateAllRefScenario - Find element by ref
 * It can use callback in field.refSelector if you want to add custom selector for current validation field
 * ref name will specify in field.ref, by default it will ${key}Ref
 *
 * @param {String} key - name of validation prop
 * */
function validateAllRefScenario(key) {
  let invalid = false;
  const field = this.fields[key];
  const ref = this.scope.refs[field.ref || `${key}Ref`];
  if (ref) {
    const node = field.refSelector ? field.refSelector.call(this.scope, ref) : ref;
    if (!node) throw TypeError(`Node in field '${key}' not found`);
    const result = this.validateField(node);
    if (result) invalid = result;
  } else {
    throw TypeError(`Field '${key}' ref doesn't exist`);
  }
  return invalid;
}
