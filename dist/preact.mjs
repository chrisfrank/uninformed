import preact from 'preact';

function buildRequest({
  data,
  headers,
  method,
  onLoad,
  responseType,
  url,
}) {
  let req = new XMLHttpRequest();
  req.responseType = responseType;
  req.open(method, url, true);
  Object.keys(headers).forEach(key => {
    req.setRequestHeader(key, headers[key]);
  });
  req.onload = onLoad;
  return req;
}

function buildResponse(request) {
  return {
    body: request.response,
    headers: request.getAllResponseHeaders(),
    ok: request.status < 300,
    status: request.status,
  };
}

function noop(wtf) {
  return wtf;
}

function filter(props, blocklist) {
  return Object.keys(props).reduce(function(memo, key) {
    var ok = blocklist.indexOf(key) === -1;
    if (ok) memo[key] = props[key];
    return memo;
  }, {})
}

var privateProps = [
  "headers",
  "onError",
  "onSuccess",
  "responseType",
  "transform",
];

function uninformed(vdom) {
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
      this.props.onSubmit(event);

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
        handler(this.props.transform(res));
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

function fetching(vdom) {
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

var Form = uninformed(preact);
var Fetcher = fetching(preact);

export { Form, Fetcher };
