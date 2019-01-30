# React easy validation BETA



Another validation on React which I actively use 


## Get started

**Install**  
`
npm i react-easy-validate
`

**Add to component**  
Validation has several ways to use and showing errors:

##### 1) By component's DOM element, without using refs for each element only for parent element

1. Add to each element name and add validation wrapper class to wrapper
2. Save ref of form element or other wrapper element
3. Create new instance of Validation class in your component
 	
```jsx harmony
import {Validate} from 'react-easy-validate';

export class Form extends Component {
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
	changeHandler = ({target}) => {
	    this.validator.validateField(target);
	};
    submitForm = (e) => {
        if( this.validator.validateAll() ) {
            // ... send form
        }
        e.preventDefault();
    };
	render() {
		return (
			<form onSubmit={this.submitForm} ref={node => this.validationNode = node}>
				<div className='form-control validation-wrapper'>
					<input name="email"
						   placeholder='email'
						   onChange={this.changeHandler}
						   />
				</div>
				<div className='form-control validation-wrapper'>
					<input name="password"
						   placeholder='password'
						   onChange={this.changeHandler}
						   />
				</div>
				<button
					type="submit">
					Sign in
				</button>
			</form>
		)
	}
}
```
##### 2) By refs for every input element

1. Add for each element name and ref then add validation wrapper class to wrapper
2. Create new instance of Validation class in your component

```jsx harmony
import {Validate} from 'react-easy-validate';

export class Form extends Component {
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
                    scope: this,
                    createErrorElement: {
                    	findAllByRefs: true,
                    }
	    })
	}
	changeHandler = ({target}) => {
	    this.validator.validateField(target);
	};
    submitForm = (e) => {
        if( this.validator.validateAll() ) {
                    // ... send form
        }
        e.preventDefault();
    };

	render() {
		return (
			<form onSubmit={this.submitForm}>
				<div className='form-control validation-wrapper'>
					<input name="email"
						   ref='emailRef'
						   placeholder='email'
						   onChange={this.changeHandler}
						   />
				</div>
				<div className='form-control validation-wrapper'>
					<input name="password"
						   ref='passwordRef'
						   placeholder='password'
						   onChange={this.changeHandler}
						   />
				</div>
				<button
					type="submit">
					Sign in
				</button>
			</form>
		)
	}
}
```

#TODO

To add last validation method

Refactor code

Add more validation rules and do them more expandable

Add JsDoc

# License

MIT.

[rimraf]: https://github.com/isaacs/rimraf
