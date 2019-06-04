// html, React, and uninformed are already in global scope
//
const html = htm.bind(React.createElement);

class MyForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      body: undefined,
      status: undefined,
    }

    this.handleSubmit = event => {
      console.log('submitted!', event)
    }

    this.handleError = res => {
      console.log('Error!', res)
      this.setState({ status: res.status, body: res.responseText })
    }

    this.handleSuccess = res => {
      console.log('Success!', res)
      this.setState({ status: res.status, body: res.responseText })
    }
  }

  render() {
    return html`
      <div id="example">
        <style type="text/css">
          #example { font-family: menlo, monospace; }
          label { display: block; }
        </style>
        <h1>Stock form</h1>
        <${uninformed.Form}
          action="/submissions"
          onSuccess=${this.handleSuccess}
          onError=${this.handleError}
          onSubmit=${this.handleSubmit}
        >
          <p>
            <label>Title</label>
            <input type="text" name="title" />
          </p>
          <p>
            <label>Address (city)</label>
            <input type="text" name="address[city]" />
          </p>
          <p>
            <label>Address (state)</label>
            <input type="text" name="address[state]" />
          </p>
          <p>
            <h3>Tags</h3>
            <label>
              <input type="checkbox" value="East" name="tags[]" />
               East
             </label>
            <label>
              <input type="checkbox" value="West" name="tags[]" />
               West
             </label>
           </p>
          <p>
            <button type="submit">Send</button>
          </p>
        <//>
        <h2>Last response:</h2>
        <p>
          ${this.state.body}
        </p>
      </div>
    `
  }
}

ReactDOM.render(html`<${MyForm} />`, document.getElementById('app'))
