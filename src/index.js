import {
  parseRules, callRule, getInvalidMessage, toggleMessageElement, toggleInvalidClass,
} from './helpers';
import { rules } from './rules';

const ELEMENT_DEEP_SIZE = 10;
const WRAPPER_CLASS = 'validation-wrapper';
const ERROR_MESSAGE_CLASS = 'validation-error-message';
const ERROR_CLASS = 'validation-error';

/**
 * @props :
 *   @el: Element of react component, case ReactDOM.findDOMNode will be deprecated in future. By default it will be validationNode in component
 *   @scope: ReactComponent  important if you use createErrorElement
 *   @fields: {
 *       [field-name] : {
 *           rules: 'required' \ ['required'] | [(val) => !val], # list of validation rules
 *           message: 'Incorrect value in field' # head message shows after each error
 *           ref: 'string' # field to find element in refs Object of react component,
 *           you can keep it empty and by default will use `${field}Ref`
 *           refSelector: function #help function to find needed element in ref
 *       }
 *   },
 *   @createErrorElement {
 *   # if this prop passed you can do not write error handler with {validate('field')}
 *   # but important to use fields that validator must validate and wrapper element
 *   className in wrapperClass to which the error element will be added
 *      wrapperClass: String // className to which the error element will be added
 *      errorMessageClass: String // className of element with message of error,
 *      errorClass: String // className that add to wrapper
 *      findAllByDom: Object with settings for find elements by querySelector
 *      findAllByRefs: Object or Boolean with settings for find elements by Ref
 *      cacheAllByDom: Boolean // will you cache element's that be found in component's dom
 *   },
 *   @rules: custom array of rules
 */
export class Validate {
  constructor(props = {}) {
    this.fields = props.fields || {};
    this.scope = props.scope;
    this.$el = props.scope.validationNode || props.element;
    this.createErrorElement = props.createErrorElement || {};
    this.rules = {
      ...rules,
      ...props.rules,
    };
    if (!this.createErrorElement.wrapperClass) this.createErrorElement.wrapperClass = WRAPPER_CLASS;
    if (!this.createErrorElement.errorClass) this.createErrorElement.errorClass = ERROR_CLASS;
    if (!this.createErrorElement.errorMessageClass) this.createErrorElement.errorMessageClass = ERROR_MESSAGE_CLASS;
    if (!this.fields) {
      throw TypeError('fields important to use createErrorElement');
    }
    this.validateFieldStore = new Map();
  }

  /**
     * Important validation method for createValidateErrorScenario
     * @element: Required prop: DOM element for validation
     * @validation: Custom prop for validation rule (for default they takes from fields.field.rules)
     */

  validateField(element, validation = this.fields[element.name].rules) {
    const value = element.value;
    let invalid = false;
    const saved = this.validateFieldStore.get(element);
    let messageEl;
    let firstError;
    let
      wrapper;
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
    return invalid;
  }

  /**
     * Validate all method support 3 scenarios:
     * @DOM Scenario: By react-dom find component's el and find fields by query-selector (Are you sure that found element will be the element that you need?)
     * @REF Scenario: By refs (it's priority variant, because it's guarantees stability and does not confuse nodes)
     *
     * @Simple Scenario: You process errors in component and look only on validation component errors
     * function will cache fields that will be find in component's DOM, you can remove this option in createErrorElement.cacheAllByDom
     */
  validateAll(fields) {
    if (this.createErrorElement) {
      const cmpEl = this.$el;
      if (fields) {
        return fields.map(key => validateAllWithCreatingErrorEl.call(this, key, cmpEl)).some(el => el === true);
      }
      return Object.keys(this.fields)
        .map(key => validateAllWithCreatingErrorEl.call(this, key, cmpEl))
        .some(el => el === true);
    }
    return this.validateAllSimple(fields);
  }

  validateAllSimple() {
    console.log(this);
  }
}

/**
 * Scenarios wrapper
 */
function validateAllWithCreatingErrorEl(key, cmpEl) {
  if (this.createErrorElement.findAllByRefs) {
    return validateAllRefScenario.call(this, key);
  }
  if (!cmpEl) throw TypeError('Component\'s el doesn\'t exist');
  return validateAllDomScenario.call(this, key, cmpEl);
}

/**
 * Find in Component's Dom element for validate and show error
 *
 * It can use callback in field.domSelector if you want to add custom selector for current validation field
 * It can use callback in findAllByDom.domSelector if you want to add custom selector for current component
 * By default selector search input with name = validation field name
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
 * Find element by ref
 *
 * It can use callback in field.refSelector if you want to add custom selector for current validation field
 * ref name will specify in field.ref, by default it will ${key}Ref
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

/**
 * Find wrapper of current element for adding error class and validation error message
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
