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

function PreactApp() {
  return html`
    <${PreactForm}
      action="/input"
      onSuccess=${handleSuccess}
      onError=${handleError}
      transform=${xform}
    >
      <h1>Preact Form</h1>
      <input type="text" name="name" />
      <input type="submit" value="Submit" />
      <${Fetcher}
        url="/data"
        transform=${xform}
        render=${data => html`<h2>fetched ${data}</h2>`}
      />
    <//>
  `
}

function ReactApp() {
  return jsx`
    <${ReactForm}
      action="/input"
      onSuccess=${handleSuccess}
      onError=${handleError}
      transform=${xform}
    >
      <h1>React Form</h1>
      <input type="text" name="name" />
      <input type="submit" value="Submit" />
    <//>
  `
}

preact.render(html`<${PreactApp} />`, document.getElementById('preact-root'));
ReactDOM.render(jsx`<${ReactApp} />`, document.getElementById('react-root'));
