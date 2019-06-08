# Uninformed

Stupid simple forms for React and Preact

## Why?

[Controlled Components](https://reactjs.org/docs/forms.html#controlled-components)
are wonderful for building complex forms, but they can make building simple
forms complicated. Sometimes I just want my form library to do two things:

- [x] Prevent double-submissions
- [x] Send data to the server without refreshing the page

Is that too much to ask?

## How?

### Install the package:

```
npm install uninformed
```

You’ll also need either React >= 16 or Preact >= 8.)

### Use a form:

```jsx
import { Form } from 'uninformed';
import React from 'react';

export const SignupForm = () => (
  <Form action="/api/signups">
    <input type="email" name="email" required />
    <input type="submit" value="Sign Up" />
  </Form>
)
```

That’s it! No onChange handlers, no render-props, just a lightly-enhanced
HTML form that disables itself on submit, sends data to a server via AJAX, and
re-enables itself after the server responds.

- [Basic Props](#basic-props)
  - [action](#action)
  - [method](#method)
  - [enctype / encType](#enctype--enctype)
  - [onSubmit](#onsubmit)
  - [beforeSend](#beforesend)
  - [onSuccess](#onsuccess)
  - [onError](#onerror)
- [Advanced Props](#advanced-props)
  - [serialize](#serialize)
  - [send](#send)
- [Use In Preact](#use-in-preact)
- [Browser Support](#browser-support)
- [Prior Art](#prior-art)
- [Contributing](#contributing)
  - [Bugs](#bugs)
  - [Pull Requests](#pull-requests)

## Basic Props

### action

> `string` | any valid URI

The URI of the service that will process your form, e.g. `/api/signups`

### method

> `string` | any valid HTTP verb | defaults to `POST`

The HTTP method to use when sending the form data, e.g. `POST`, `PATCH`, etc

### enctype / encType

> `string` | defaults to `application/x-www-form-urlencoded`

The encoding of the Form. Like the standard HTML `enctype` attribute, you can
set this prop to `multipart/form-data` to support file uploads. Unlike the HTML
`enctype` attribute, you can also set this prop to `application/json` to send
JSON. Note that React expects form elements to have a camelCase `encType` prop
instead of `enctype`. Uninformed supports either style and converts to
camelCase internally.

### onSubmit

> `function(event, payload)` | optional

Called when a form is submitted. Use `onSubmit` to perform client-side
validation, trigger updates to your UI, etc. You can return `false` from this
function to prevent your `Form` from submitting.

### beforeSend

> `function(xhr)` | optional

Manipulate your form's
[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
instance before sending. Use this prop set auth headers, configure CORS, etc:

```jsx
const SignupForm = () => (
  <Form
    action="/api/signups"
    beforeSend={xhr => {
      // include auth credentials
      xhr.setRequestHeader("Authorization", `Bearer ${USER_AUTH_TOKEN}`);
      // parse response as JSON automatically
      xhr.responseType = "json";
      // add a pogress meter?
      xhr.addEventListener("progress", this.props.onProgressUpdate);
    }}
  >
    <input type="email" name="email" required />
    <input type="submit" value="Sign Up" />
  </Form>
);
```

### onSuccess

> `function(xhr)` | optional

Handle a successful form response.

```jsx
const AuthForm = props => (
  <Form
    action="/login"
    onSuccess={xhr => {
      const user = JSON.parse(xhr.responseText);
      props.onLogin(user);
    }}
  >
    <input type="email" name="email" required />
    <input type="password" name="password" required />
    <input type="submit" value="Log In" />
  </Form>
);
```

### onError

> `function(xhr)` | optional

Handle a failed form response.

```jsx
const AuthForm = () => (
  <Form
    action="/login"
    onError={xhr => {
      const error = JSON.parse(xhr.responseText);
      alert(`Error ${xhr.status}: ${error.message}`);
    }}
  >
    <input type="email" name="email" required />
    <input type="password" name="password" required />
    <input type="submit" value="Log In" />
  </Form>
);
```

## Advanced Props

### serialize

> `function(HTMLFormElement)`

Use a custom serializer. The built-in serializers for url-encoded and multipart
encodings follow the [qs](https://github.com/ljharb/qs)/Rails standard for
nested object support, but the built-in JSON serializer doesn't support
nested objects. Here's how you could serialize nested JSON with help from
[form-serialize](https://github.com/defunctzombie/form-serialize).

```jsx
import { Form } from "uninformed";
import serialize from "form-serialize";

const SignupForm = () => (
  <Form
    action="/signup"
    serialize={formElement => {
      const data = serialize(formElement, { hash: true });
      // data looks like this:
      //  {
      //    user: {
      //      name: 'abc',
      //      email: 'abc@123.com',
      //      interests: ['Ethics', 'Food'],
      //    },
      //  }
      return JSON.stringify(data);
    }}
  >
    <input type="user[name]" name="text" required />
    <input type="user[email]" name="email" required />
    <select multiple name="interests[]">
      <option value="Ethics">Ethics</option>
      <option value="Food">Food</option>
    </select>
    <input type="submit" value="Sign Up" />
  </Form>
);
```

### send

> `function(payload, formInstance) => promise`

Use a custom function to send your form data, instead of the XMLHttpRequest
Uninformed uses by default. **This function must return a Promise.** Here's an
example that uses the
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

```jsx
const SignupForm = props => (
  <Form
    action="/api/signups"
    enctype="application/json"
    send={(payload, formInstance) => {
      const { method, action } = formInstance.props;
      return fetch(action, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.authToken}`
        },
        method,
        body: payload
      }).then(res => res.json());
    }}
  >
    <input type="email" name="email" required />
    <input type="submit" value="Sign Up" />
  </Form>
);
```

## Use In Preact

Uninformed is built as a library-agnostic
[factory function](https://github.com/preactjs/preact/issues/408). To use it in
Preact without a compatibility layer, import the factory directly:

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

## Browser Support

Uninformed supports modern browsers and IE11. If you use a custom `send`
function, you will need to
[polyfill Promise support](https://www.npmjs.com/package/promise-polyfill)
in IE.

## Prior Art

- [react-formify - npm](https://www.npmjs.com/package/react-formify)
- [react-uncontrolled-form - npm](https://www.npmjs.com/package/react-uncontrolled-form)
- [react-form-uncontrolled - npm](https://www.npmjs.com/package/react-form-uncontrolled)

None of these libraries handle submitting data or preventing double-submissions,
but they do handle client-side validation.

## Contributing

### Bugs

Please open [an issue](https://github.com/chrisfrank/uninformed/issues) on
Github.

### Pull Requests

PRs are welcome, and I'll do my best to review them promptly.
