import { buildRequest, buildResponse, defaultProps, filter } from './utils';


export function factory(vdom) {
  var createElement = vdom.createElement || vdom.h;
  var Component = vdom.Component;

  class Form extends Component {
    constructor(props) {
      super(props);
      this.handleLoad = this.handleLoad.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
      event.preventDefault();
      var props = Object.assign({}, this.props, {
        url: this.props.action,
        onLoad: this.handleLoad,
      });
      var req = buildRequest(props);
      var data = new FormData(event.target);
      req.send(data);
      this.setState({ req, res: undefined });
    }

    handleLoad(event) {
      var res = buildResponse(event.target);
      this.setState({
        req: undefined,
        res: this.props.transform(res),
      });
    }

    componentDidUpdate(prevProps, prevState) {
      var { res } = this.state;
      if (res && res !== prevState.res) this.props.onResponse(res);
    }

    render() {
      var passedProps = Object.assign({}, filter(this.props), {
        onSubmit: this.handleSubmit,
      });

      return createElement('form', passedProps);
    }
  }

  Form.defaultProps = defaultProps;
  return Form;
}
