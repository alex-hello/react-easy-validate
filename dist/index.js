'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Validate = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('./helpers');

var _rules = require('./rules');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ELEMENT_DEEP_SIZE = 10;
var WRAPPER_CLASS = 'form-group';
var ERROR_MESSAGE_CLASS = 'validation-error-message';
var ERROR_CLASS = 'validation-error';

/**
 * @class Validate Construct new validation instance
 */

var Validate = exports.Validate = function () {
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
  function Validate(_ref) {
    var fields = _ref.fields,
        scope = _ref.scope,
        element = _ref.element,
        createErrorElement = _ref.createErrorElement,
        rules = _ref.rules;

    _classCallCheck(this, Validate);

    this.fields = fields || {};
    this.scope = scope;
    if (createErrorElement !== undefined) {
      this.createErrorElement = Object.prototype.toString.call(createErrorElement) === '[object Object]' ? createErrorElement : {};
    }
    this.rules = _extends({}, _rules.rules, rules);
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

  _createClass(Validate, [{
    key: 'validateField',
    value: function validateField(element) {
      var validation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.fields[element.name].rules;

      var value = element.value;
      var invalid = false;
      var saved = this.validateFieldStore.get(element);
      var messageEl = void 0;
      var firstError = void 0;
      var wrapper = void 0;
      if (saved) {
        wrapper = saved.wrapper;
        messageEl = saved.messageEl;
      }
      var inputRulesArr = (0, _helpers.parseRules)(validation);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = inputRulesArr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var rule = _step.value;

          var result = (0, _helpers.callRule)(rule, value);
          if (!result || typeof result === 'string') {
            invalid = true;
            firstError = _helpers.getInvalidMessage.call(this, result || validation.message, rule);
            if (saved) {
              wrapper = saved.wrapper;
              messageEl = (0, _helpers.toggleMessageElement)(firstError, this.createErrorElement.errorMessageClass, saved.messageEl);
            } else {
              wrapper = findWrapper.call(this, element);
              messageEl = (0, _helpers.toggleMessageElement)(firstError, this.createErrorElement.errorMessageClass);
            }
            this.validateFieldStore.set(element, {
              firstError: firstError,
              messageEl: messageEl,
              wrapper: wrapper,
              rule: rule
            });
            if (!wrapper.contains(messageEl)) {
              wrapper.appendChild(messageEl);
            }
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (wrapper) {
        (0, _helpers.toggleInvalidClass)(wrapper, invalid);
      }
      if (!invalid && wrapper && wrapper.contains(messageEl)) {
        wrapper.removeChild(messageEl);
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

  }, {
    key: 'validateAll',
    value: function validateAll(fields) {
      var _this = this;

      if (this.createErrorElement) {
        var cmpEl = this.$el || this.scope.validationNode;
        if (fields) {
          return fields.map(function (key) {
            return validateAllWithCreatingErrorEl.call(_this, key, cmpEl);
          }).some(function (el) {
            return el === true;
          });
        }
        return Object.keys(this.fields).map(function (key) {
          return validateAllWithCreatingErrorEl.call(_this, key, cmpEl);
        }).some(function (el) {
          return el === true;
        });
      }
      return validateSimple.call(this, fields);
    }

    /**
       * @function check - Field in validation object with rules and etc
       * @param: {String} validateField - field that must be validate in this.fields
       * @param: {String, Function} validation - Property for passing validation settings
       * */

  }, {
    key: 'check',
    value: function check(validateField, validation) {
      var fieldObj = findFieldIn(validateField, this.fields);
      var scopedField = findFieldIn(fieldObj.field || validateField, this.scope.state);
      if (fieldObj.invalid === undefined) initValidationObj(fieldObj);
      var validationRules = validation || this.fields[validateField].rules;
      var invalid = false;
      var firstError = void 0;
      if (!validationRules) throw TypeError('Validation rules doesn\'t exist in params and fields');
      var rulesArr = (0, _helpers.parseRules)(validationRules);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = rulesArr[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var rule = _step2.value;

          var result = (0, _helpers.callRule)(rule, scopedField);
          if (!result || typeof result === 'string') {
            invalid = true;
            firstError = _helpers.getInvalidMessage.call(this, result || fieldObj.message, rule);
            break;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      fieldObj.invalid = invalid;
      return firstError && fieldObj.showError ? firstError : '';
    }

    /**
       * @function isInvalid - check field for valid value in state
       * @param: {String} field - field that must be validate in this.fields
       * */

  }, {
    key: 'isInvalid',
    value: function isInvalid(field) {
      return this.fields[field].invalid && this.fields[field].showError;
    }
  }]);

  return Validate;
}();
/**
 * @function findFieldIn - support function wrapper for findDeepField
 * @param {String} field - name of field, supports 'field.inner.inner.inner'
 * @param {Object} where - object where u will search field
 */


function findFieldIn(field, where) {
  var parsedField = field.split('.');
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
  var find = where;
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
  var toggleElement = element.classList.contains(this.createErrorElement.wrapperClass) ? element : null;
  var deepCounter = ELEMENT_DEEP_SIZE;
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
  var _this2 = this;

  var hasError = false;
  (fields || Object.keys(this.fields)).forEach(function (validateField) {
    var fieldObj = _this2.fields[validateField];
    var scopedField = _this2.scope.state[validateField];
    var invalid = false;
    if (fieldObj.invalid === undefined) initValidationObj(fieldObj);
    var rulesArr = (0, _helpers.parseRules)(fieldObj.rules);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = rulesArr[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var rule = _step3.value;

        var result = (0, _helpers.callRule)(rule, scopedField);
        if (!result || typeof result === 'string') {
          invalid = true;
          hasError = invalid;
          fieldObj.invalid = invalid;
          fieldObj.showError = true;
          break;
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
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
  var invalid = false;
  var field = this.fields[key];
  var node = void 0;
  if (field.domSelector) {
    node = field.domSelector(key, this.scope);
  } else if (this.scope.findAllByDom && this.scope.findAllByDom.domSelector) {
    node = this.scope.findAllByDom.domSelector(this.scope, key);
  } else {
    node = cmpEl.querySelector('input[name=' + key + ']');
  }
  if (!node) throw TypeError('Node in field \'' + key + '\' not found');
  var result = this.validateField(node);
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
  var invalid = false;
  var field = this.fields[key];
  var ref = this.scope.refs[field.ref || key + 'Ref'];
  if (ref) {
    var node = field.refSelector ? field.refSelector.call(this.scope, ref) : ref;
    if (!node) throw TypeError('Node in field \'' + key + '\' not found');
    var result = this.validateField(node);
    if (result) invalid = result;
  } else {
    throw TypeError('Field \'' + key + '\' ref doesn\'t exist');
  }
  return invalid;
}