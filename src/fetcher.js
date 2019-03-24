import { buildRequest, buildResponse, noop } from './utils';

export function fetching(vdom) {
  var createElement = vdom.createElement || vdom.h;
  var Component = vdom.Component;

  class Fetcher extends Component {
    constructor(props) {
      super(props);
      this.state = {
        req: null,
        res: null,
      };
      this.handleLoad = this.handleLoad.bind(this);
      this.send = this.send.bind(this);
      this.seedResponse = () => {
        var { seed, transform } = this.props;
        return (
          seed &&
          transform({
            body: seed,
            headers: {},
            ok: true,
            status: 202,
          })
        );
      };
    }

    handleLoad(event) {
      var res = buildResponse(event.target);
      this.setState({
        req: undefined,
        res: this.props.transform(res),
      });
    }

    send() {
      var props = Object.assign({}, this.props, { onLoad: this.handleLoad });
      var req = buildRequest(props);
      var body = this.props.method === 'GET' ? undefined : this.props.seed;
      req.send(body);
      this.setState({ req });
    }

    componentDidMount() {
      this.setState({ res: this.seedResponse() });
      this.send();
    }

    componentDidUpdate(prevProps, prevState) {
      var { url, onResponse } = this.props;
      var { res } = this.state;

      // refetch if URL has changed
      if (url !== prevProps.url) this.send();

      // trigger onResponse callback if response has changed
      if (res && res !== prevState.res) {
        onResponse(res);
      }
    }

    render() {
      var { res } = this.state;
      return res ? this.props.render(res) : null;
    }
  }

  Fetcher.defaultProps = {
    headers: {},
    onResponse: noop,
    method: "GET",
    render: noop,
    responseType: "json",
    transform: noop,
    seed: undefined, // object
    url: undefined, // string
  };

  return Fetcher;
}
