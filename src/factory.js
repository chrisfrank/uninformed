import {
  noop,
  serializeWithFormData,
  sendWithXHR,
  validateWithFaith
} from "./utils";

export function createForm(vdom) {
  const Component = vdom.Component;
  const createElement = vdom.createElement || vdom.h;

  class Form extends Component {
    constructor(props) {
      super(props);
      this.state = {
        disabled: false
      };
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleSuccess = this.handleSuccess.bind(this);
      this.handleError = this.handleError.bind(this);
    }

    handleSubmit(event) {
      event.preventDefault();
      if (this.state.disabled) return;

      const {
        action,
        method,
        onSubmit,
        send,
        serialize,
        validate
      } = this.props;
      const data = serialize(this.formElement);
      if (!validate(data)) return;
      this.setState({ disabled: true });

      onSubmit(data);
      send({ data, method: method.toUpperCase(), url: action })
        .then(this.handleSuccess)
        .catch(this.handleError);
    }

    handleSuccess(response) {
      this.setState({ disabled: false });
      this.props.onSuccess(response);
    }

    handleError(error) {
      this.setState({ disabled: false });
      this.props.onError(error);
    }

    render() {
      const { disabled } = this.state;
      const passedProps = Object.keys(this.props).reduce(
        (props, key) => {
          if (!BLOCKLIST.has(key)) {
            props[key] = this.props[key];
          }
          return props;
        },
        {
          "data-disabled": disabled,
          onSubmit: this.handleSubmit,
          ref: elem => (this.formElement = elem)
        }
      );

      return createElement("form", passedProps, this.props.children);
    }
  }

  Form.defaultProps = {
    method: "POST",
    onError: noop,
    onSubmit: noop,
    onSuccess: noop,
    send: sendWithXHR,
    serialize: serializeWithFormData,
    validate: validateWithFaith
  };

  return Form;
}

const BLOCKLIST = new Set([
  "onError",
  "onSubmit",
  "onSuccess",
  "send",
  "serialize",
  "validate",
  "ref",
  "data-disabled"
]);

export { sendWithXHR, serializeWithFormData };
