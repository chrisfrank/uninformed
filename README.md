
# Uninformed
Stupid simple forms for React and Preact

## Why?
[Controlled Components](https://reactjs.org/docs/forms.html#controlled-components) are wonderful for building complex forms, but they can make building simple forms complicated. Sometimes I just want my form library to do two things:

- Prevent double-submissions
- Send data to the server

Is that too much to ask?

## How?
### Install the package:

`npm install uninformed`

(You’ll also need either React >= 16 or Preact >= 8.)

### Use a form:

```jsx
import { Form } from 'uninformed';
import React from 'react';

export default const SignupForm = () => (
	<Form action="/api/signups">
		<input type="email" name="email" required />
		<input type="submit" value="Sign Up" />
	</Form>
)
```

That’s it! No hooks, no context, no onChange handlers, just a lightly-enhanced HTML form element that disables itself on submit, sends [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) to a server via an [XMLHttpRequest](https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest), and re-enables itself after the server responds.

## Use In Preact
Uninformed is built as a library-agnostic [factory function](https://github.com/preactjs/preact/issues/408). To use it in Preact without a compatibility layer, import the factory directly:

```jsx
import { createForm } from 'uninformed/factory';
import { h } from 'preact';
const Form = createForm(h);

export default const SignupForm = () => (
	<Form action="/api/signups">
		<input type="email" name="email" required />
		<input type="submit" value="Sign Up" />
	</Form>
)
```

## API Reference

### `<Form>`

| Property   | Type       | Default                     | Description                                                                                                                                                       |
| :--------- | :--------- | :------                     | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| action     | String     | undefined                   | The URI of the server that will process your form, e.g. `/api/signups`
| method     | String     | `POST`                      | The HTTP method to use when sending the form data
| onError    | Function   | noop                        |                                                                                                                                                                   |
| onSubmit   | Function   | noop                        |                                                                                                                                                                   |
| onSuccess  | Function   | noop                        |
| send       | Function   | `sendWithXHR`               |
| serialize  | Function   | `serializeWithFormData`     |
| validate   | Function   | `validateWithFaith`         | Validate the form before submitting. The default validator always returns true.



### Customize HTTP requests with `props.send`
### Customize serialization with `props.serialize`
### Customize validation with `props.validate`


## Handling requests on the server
- Rails or Rack (Ruby)
- Express (JS)
- nested fields


## Prior Art
- [react-formify  -  npm](https://www.npmjs.com/package/react-formify)
- [react-uncontrolled-form  -  npm](https://www.npmjs.com/package/react-uncontrolled-form)
- [react-form-uncontrolled  -  npm](https://www.npmjs.com/package/react-form-uncontrolled)

None of these libraries handle submitting data or preventing double-submissions, but they do handle client-side validation. For the simple forms Uninformed is intended to power, though, I’d just handle client-side validation via native [HTML5 input attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation).
