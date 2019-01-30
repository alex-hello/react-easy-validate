# React easy validation BETA



Еще одна валидация на React которой я активно пользуюсь


## Get started

**Install**  
`
npm i react-easy-validate
`

**Add to component**  
Validation has several ways to use and showing errors:

1) By component's DOM element, without using refs for each element only for parent element

	a) Add to each element name and add validation wrapper class to wrapper
	b) Save ref of form element or other wrapper element
 	c) Create new instance of Validation class in your component
 	
```jsx harmony
import {Validate} from 'react-easy-validate';

export class Form extends Component {
	constructor() {
	    super();
	    this.validator = new Validate({
	                fields            : {
                        email   : {
                            rules: 'required,email',
                        },
                        password: {
                            rules: ['required', val => val.length > 5 ? true : 'Password is incorrect'],
                        },
                    },
                    scope             : this
	    })
	}
	changeHandler = ({target}) => {
	    this.validator.validateField(target);
	};
    submitForm = (e) => {
        console.log(this.validator.validateAll());
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


# Tasks

Add socket.io support

Add migrations

Add logging

# License

MIT.

[rimraf]: https://github.com/isaacs/rimraf
