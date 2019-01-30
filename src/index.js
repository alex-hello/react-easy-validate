import {parseRules, callRule, getInvalidMessage, toggleMessageElement, toggleInvalidClass} from './helpers';

const ELEMENT_DEEP_SIZE = 10;
const FIND_ALL_BY_REF_VAL = 'refs';
const FIND_ALL_BY_DOM_VAL = 'dom';

/**
 * @props :
 *   @scope: ReactComponent  important if you use createErrorElement
 *   @fields: {
 *       [field-name] : {
 *           rules: 'required' \ ['required'] | [(val) => !val], # list of validation rules
 *           message: 'Incorrect value in field' # head message shows after each error
 *           ref: 'string' #if you use findAllBy: 'refs' this field is important
 *       }
 *   },
 *   @createErrorElement {
 *   # if this prop passed you can do not write error handler with {validate('field')}
 *   # but important to use fields that validator must validate and wrapper element className in wrapperClass to which the error element will be added
 *      wrapperClass: String // className to which the error element will be added
 *      errorMessageClass: String // className of element with message of error,
 *      errorClass: String // className that add to wrapper
 *      findAllBy: String:ref,dom // how elements will find in react component
 *      cacheAllByDom: Boolean // will you cache element's that be found in component's dom
 *   }
 */
export class Validate {
    constructor(props = {}) {
        this.fields = props.fields || {};
        this.scope = props.scope;
        this.createErrorElement = props.createErrorElement || null;
        if (this.createErrorElement) {
            if (!this.fields || !this.createErrorElement.wrapperClass) {
                throw TypeError('fields and wrapperClass important to use createErrorElement');
            } else {
                this.validateFieldStore = new Map();
            }
        }
    }

    validateField(element, validation = this.fields[element.name].rules) {
        const value = element.value;
        let invalid = false;
        let saved = this.validateFieldStore.get(element), messageEl, firstError, wrapper;
        if (saved) {
            wrapper = saved.wrapper;
            messageEl = saved.messageEl;
        }
        const inputRulesArr = parseRules(validation);
        for (const rule of inputRulesArr) {
            const result = callRule(rule, value);
            if (!result) {
                invalid = true;
                firstError = getInvalidMessage(validation.message, rule);
                if (saved) {
                    wrapper = saved.wrapper;
                    messageEl = toggleMessageElement(firstError, this.createErrorElement.errorMessageClass, saved.messageEl);
                } else {
                    wrapper = this.findWrapper(element);
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
    }

    /**
     * Validate all method support 3 scenarios:
     * @DOM Scenario: By react-dom find component's el and find fields by query-selector (Are you sure that found element will be the element that you need?)
     * @REF Scenario: By refs (it's priority variant, because it's guarantees stability and does not confuse nodes)
     *
     * function will cache fields that will be find in component's DOM, you can remove this option in createErrorElement.cacheAllByDom
     */
    validateAll(fields) {
        if (this.createErrorElement) {
            if (this.createErrorElement.findAllBy == FIND_ALL_BY_DOM_VAL) {
                this.validateAllDomScenario(fields);
            } else if (this.createErrorElement.findAllBy == FIND_ALL_BY_REF_VAL) {
                this.validateAllRefScenario(fields);
            }
        } else {
            this.validateAllSimple(fields)
        }
    }

    validateAllDomScenario(fields) {
        // ...
    }

    validateAllRefScenario(fields) {
        // ...
    }

    validateAllSimple(fields) {
        // ...
    }

    findWrapper(element) {
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
}
