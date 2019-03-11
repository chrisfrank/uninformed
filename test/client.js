import htm from '/node_modules/htm/dist/htm.mjs';
import { uninformed, fetching } from '/dist/uninformed.mjs';
import preact from '/node_modules/preact/dist/preact.mjs';

const { React, ReactDOM } = window;
const PreactForm = uninformed(preact)
const ReactForm = uninformed(React);
const Fetcher = fetching(preact);
const jsx = htm.bind(React.createElement);
const html = htm.bind(preact.h);

function handleSuccess(msg) {
  alert(`Success: Hi ${msg}`);
}
function handleError(msg) {
  alert(`Error: ${msg}`);
}

function xform(res) {
  return res.ok ? res.body.hello : res.status
}

function handleToggle(event) {
  event.preventDefault()
  this.setState(state => ({ visible: !state.visible }))
}

function PreactApp(props) {
  this.handleToggle = handleToggle.bind(this);

  return html`
    <div>
      <button onClick=${this.handleToggle}>Toggle</button>
      ${this.state.visible && html`
        <${PreactForm}
          action="/input"
          key=${this.state.visible}
          onSuccess=${handleSuccess}
          onSubmit=${e => console.log('submitted', e) }
          onError=${handleError}
          transform=${xform}
        >
          <fieldset>
            <h1>Preact Form</h1>
            <input
            type="text"
            name="name"
            defaultValue="PREACT"
            />
            <input type="submit" value="Submit" />
            <${Fetcher}
              url="/data"
              transform=${xform}
              render=${data => html`<h2>fetched ${data}</h2>`}
            />
          </fieldset>
        <//>
      `}
    </div>
  `;
}

class ReactApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    }

    this.handleToggle = handleToggle.bind(this);
  }

  render() {
    return jsx`
      <div>
        <button onClick=${this.handleToggle}>Toggle</button>
        ${this.state.visible && jsx`
          <${ReactForm}
            action="/input"
            onSuccess=${handleSuccess}
            onSubmit=${e => console.log('submitted', e) }
            onError=${handleError}
            transform=${xform}
          >
            <h1>React Form</h1>
            <input
              type="text"
              name="name"
              defaultValue="REACT"
            />
            <input type="submit" value="Submit" />
          <//>
        `}
      </div>
    `
  }
}

preact.render(html`<${PreactApp} />`, document.getElementById('preact-root'));
ReactDOM.render(jsx`<${ReactApp} />`, document.getElementById('react-root'));
