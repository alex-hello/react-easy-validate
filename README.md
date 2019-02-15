# React easy validation BETA



Another validation on React which I use actively 


## Get started

**Install**  
`
npm i react-easy-validate
`

**First steps**  
a) Import component
```jsx
import {Validate} from 'react-easy-validate';
```

b) Create new Validation instance with fields that you will validate and create link for your component

```js
constructor() {
    super();
	this.validator = new Validate({
		fields: {
			email: {
				rules: 'required,email',
			},
			password: {
				rules: ['required', val => val.length > 5 ? true : 'Password is incorrect'],
			},
		},
		scope: this
	})
}
```
It's all that you must do for setting your component

Next choose one on ways for show validation errors:

### Simple way (with curly braces)

After input field (or on other place) call the 'check' method of Validation with name of property in your Validate config

```jsx harmony
<input name="email"
       placeholder='email'
       onChange={this.changeHandler}
/>
{this.validator.check('email')}
```
### By component's DOM element, with creating ref for parent element of inputs
1. Add params to validation settings
```js
this.validator = new Validate({
    fields: {
        email   : {
            rules: 'required,email',
        },
        password: {
            rules: ['required', val => val.length > 5 ? true : 'Password is incorrect'],
        },
    },
    createErrorElement: true, // it can be Object if u want to pass settings
    element: this.validationNode,
    scope: this,
});
```
2. Add to each element name and add validation wrapper class to wrapper (by default wrapperClass = form-group). Save ref of form element or other wrapper element
```jsx harmony
<form onSubmit={this.submitForm} ref={node => this.validationNode = node}>
	<div className='form-group'>
		<input name="email"
			   placeholder='email'
			   onChange={this.changeHandler}
		/>
	</div>
</form>
```
### By refs for each input element
1. Add params to validation settings
```js
this.validator = new Validate({
    fields: {
        email   : {
            rules: 'required,email',
        },
        password: {
            rules: ['required', val => val.length > 5 ? true : 'Password is incorrect'],
        },
    },
    createErrorElement: {
    	findAllByRefs: true, // add this param
    },
    scope: this,
});
```
2. Add for each element name and ref then add validation wrapper class to wrapper
```jsx harmony
<div className='form-group'>
	<input name="email"
		   placeholder='email'
		   ref='emailRef'
		   onChange={this.changeHandler}
	/>
</div>
```

#TODO

Refactor code

Add more validation rules and do them more expandable

Add Api info

# License

MIT.

[rimraf]: https://github.com/isaacs/rimraf
