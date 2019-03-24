'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function noop(wtf) {
  return wtf;
}

function buildRequest({
  url,
  data,
  headers = {},
  method = "GET",
  onLoad = noop,
  responseType = "json",
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

function removeBlocklistedProps(props, blocklist) {
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
        handler(this.props.transform(res));
      }
    }

    setFormElement(ref) {
      this.formElement = ref;
    }

    render() {
      var passedProps = Object.assign(
        {},
        removeBlocklistedProps(this.props, privateProps),
        {
          onSubmit: this.handleSubmit,
          ref: this.setFormElement.bind(this),
          'data-disabled': !!this.state.req,
        }
      );

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

exports.uninformed = uninformed;
exports.buildRequest = buildRequest;
exports.buildResponse = buildResponse;
