// html, React, and uninformed are already in global scope
//
const html = htm.bind(React.createElement);

class FormController extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      body: undefined,
      status: undefined,
    }

    this.handleSubmit = (event, payload) => {
      console.log('submitted!', event, payload)
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
    const { title, ...rest } = this.props;
    return html`
      <div>
        <h2>${title}</h2>
        <${uninformed.Form}
          ...${rest}
          onSuccess=${this.handleSuccess}
          onError=${this.handleError}
          onSubmit=${this.handleSubmit}
        >
          <${Inputs} />
        <//>
        <h2>last response:</h2>
        <p>
          ${this.state.body}
        </p>
      </div>
    `
  }
}

function Inputs() {
  return html`
    <fieldset>
      <p>
        <label>Title</label>
        <input type="text" name="title" />
      </p>
      <p>
        <label>Status</label>
        <select name="status">
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </p>
      <p>
        <label>Categories</label>
        <select multiple name="categories[]">
          <option value="art">Art</option>
          <option value="life">Life</option>
        </select>
      </p>
      <p>
        <label>Author (email)</label>
        <input type="text" name="author[email]" />
      </p>
      <div>
        <h3>Tags</h3>
        <label>
          <input type="checkbox" value="East" name="tags[]" />
           East
         </label>
        <label>
          <input type="checkbox" value="West" name="tags[]" />
           West
         </label>
      </div>
      <p>
        <button type="submit">Send</button>
      </p>
    <//>
  `
}

function Client() {
  return html`
    <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <${FormController}
        title="Stock"
        action="/submissions"
      />
      <${FormController}
        title="JSON"
        action="https://jsonplaceholder.typicode.com/posts"
        enctype="application/json"
      />
    </div>
  `
}

ReactDOM.render(html`<${Client} />`, document.getElementById('app'))
