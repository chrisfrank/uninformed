import {
  buildRequest,
  buildResponse,
  defaultProps,
  filter,
  encode,
} from './utils';

export function factory(vdom) {
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
      req.send(encode({ data, type: this.props.responseType }));
      this.setState({ req, res: undefined });
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

    render() {
      var passedProps = Object.assign({}, filter(this.props), {
        onSubmit: this.handleSubmit,
        disabled: !!this.state.req,
      });

      return createElement('form', passedProps);
    }
  }

  Form.defaultProps = defaultProps;
  return Form;
}
