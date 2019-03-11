import {
  buildRequest,
  buildResponse,
  filter,
  noop,
} from './utils';

var privateProps = [
  "headers",
  "onError",
  "onSuccess",
  "responseType",
  "transform",
];

export function uninformed(vdom) {
  var createElement = vdom.createElement || vdom.h;
  var Component = vdom.Component;

  class Form extends Component {
    constructor(props) {
      super(props);
      this.state = {
        req: undefined,
        res: undefined,
      };
      this.handleLoad = this.handleLoad.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    // Hack around Component Recycling in Preact <= 8 to prevent inputs from
    // rendering with values from previous mounts.
    // See https://github.com/developit/preact/issues/957
    componentDidMount() {
      this.formElement && this.formElement.reset();
    }

    handleSubmit(event) {
      event.preventDefault();

      // to prevent double-submissions, disable immediately, not via setState
      if (this.disabled) return;
      this.disabled = true;
      var props = Object.assign({}, this.props, {
        url: this.props.action,
        onLoad: this.handleLoad,
      });
      var req = buildRequest(props);
      var data = new FormData(event.target);
      req.send(data);
      this.setState({ req, res: undefined });
      this.props.onSubmit(event);
    }

    handleLoad(event) {
      this.disabled = false;
      var res = buildResponse(event.target);
      this.setState({
        req: undefined,
        res: res,
      });
    }

    componentDidUpdate(prevProps, prevState) {
      var { res } = this.state;
      if (res && res !== prevState.res) {
        var handler = res.ok ? this.props.onSuccess : this.props.onError;
        handler(this.props.transform(res))
      }
    }

    setFormElement(ref) {
      this.formElement = ref;
    }

    render() {
      var passedProps = Object.assign({}, filter(this.props, privateProps), {
        onSubmit: this.handleSubmit,
        ref: this.setFormElement.bind(this),
        'data-disabled': !!this.state.req,
      });

      return createElement('form', passedProps);
    }
  }

  Form.defaultProps = {
    headers: {},
    method: 'POST',
    onError: noop,
    onSubmit: noop,
    onSuccess: noop,
    responseType: 'json',
    transform: noop,
  };

  return Form;
}
