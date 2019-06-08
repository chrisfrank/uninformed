import { noop, serializers, sendWithXHR } from './utils';

export function createForm(vdom) {
  const Component = vdom.Component;
  const createElement = vdom.createElement || vdom.h;

  class Form extends Component {
    constructor(props) {
      super(props);
      this.state = {
        disabled: false,
      };
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleSuccess = this.handleSuccess.bind(this);
      this.handleError = this.handleError.bind(this);
    }

    get enctype() {
      return this.props.enctype || this.props.encType;
    }

    get method() {
      return this.props.method.toUpperCase();
    }

    handleSubmit(event) {
      event.preventDefault();
      if (this.state.disabled) return;

      const { action, serialize, onSubmit, send, beforeSend } = this.props;
      const serializer = serialize || serializers[this.enctype];
      if (!serializer) {
        throw `No serializer for enctype type "${this.enctype}!"`;
      }
      const payload = serializer(this.formElement);
      if (onSubmit(event, payload) === false) return;

      this.setState({ disabled: true });

      if (send) {
        send(payload, this)
          .then(this.handleSuccess)
          .catch(this.handleError);
      } else {
        sendWithXHR({
          body: payload,
          contentType: this.enctype,
          method: this.method,
          onError: this.handleError,
          onSuccess: this.handleSuccess,
          beforeSend,
          url: action,
        });
      }
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
          disabled,
          encType: this.enctype,
          onSubmit: this.handleSubmit,
          ref: elem => (this.formElement = elem),
        }
      );

      return createElement('form', passedProps, this.props.children);
    }
  }

  Form.defaultProps = {
    beforeSend: noop,
    encType: 'application/x-www-form-urlencoded',
    method: 'POST',
    onError: noop,
    onSubmit: noop,
    onSuccess: noop,
  };

  return Form;
}

const BLOCKLIST = new Set([
  'beforeSend',
  'enctype',
  'onError',
  'onSubmit',
  'onSuccess',
  'send',
  'serialize',
  'ref',
  'data-disabled',
]);
