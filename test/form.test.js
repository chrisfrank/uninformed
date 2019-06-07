import tap from "tap";
import { mount } from "enzyme";
import xhr from "xhr-mock";
import { html } from "./helper";
import { Form, sendWithXHR } from "../src/index";
import "./dom";

const renderForm = (props = {}) =>
  mount(html`
    <${Form} action="/api" ...${props}>
      <input type="text" name="email" defaultValue="picard@starfleet.gov" />
      <button type="submit">Send</button>
    <//>
  `);

function mockSubmit(wrapper) {
  wrapper.find("form").simulate("submit", { preventDefault: function() {} });
}

tap.test("it disables itself on submit", t => {
  var submissionCount = 0;
  const wrapper = renderForm({ onSubmit: () => (submissionCount += 1) });

  mockSubmit(wrapper);
  t.equal(wrapper.state("disabled"), true, 'disabled in state');
  t.equal(wrapper.find("form[disabled]").length, 1, 'disabled in DOM');
  t.equal(submissionCount, 1, 'submitted once');

  wrapper.find("form").simulate("submit");
  t.equal(submissionCount, 1, 'did not submit twice');
  t.end();
});

tap.test("it calls props.onSubmit with data when submitted", t => {
  let submitted = false;

  function handleSubmit(event, payload) {
    submitted = payload;
  }

  const wrapper = renderForm({ onSubmit: handleSubmit });

  mockSubmit(wrapper);
  t.assert(submitted);
  t.end();
});

tap.test('it sets the correct XHR content type based on props.enctype', t => {
  t.plan(4)
  const multipart = renderForm({
    encType: 'multipart/form-data',
    onSuccess: res => {
      const ct = JSON.parse(res.responseText)['content-type'];
      t.equal(ct, 'multipart/form-data', 'multipart/form-data');
    }
  });

  const urlEncoded = renderForm({
    enctype: 'application/x-www-form-urlencoded',
    onSuccess: res => {
      const ct = JSON.parse(res.responseText)['content-type'];
      t.equal(ct, 'application/x-www-form-urlencoded', 'url-encoded')
    }
  });

  const jsonEncoded = renderForm({
    enctype: 'application/json',
    onSuccess: res => {
      const ct = JSON.parse(res.responseText)['content-type'];
      t.equal(ct, 'application/json', 'application/json')
    }
  });

  const invalidEncoded = renderForm({ enctype: 'will raise' })

  mockSubmit(multipart)
  mockSubmit(urlEncoded)
  mockSubmit(jsonEncoded)
  t.throws(() => mockSumbit(invalidEncoded))
})

tap.test("it accepts a custom `serialize` fn", t => {
  let data = {};

  const wrapper = renderForm({
    encoding: 'multipart/form-data',
    serialize: formElement => {
      const nativeSerialization = new FormData(formElement);
      data["email"] = nativeSerialization.get("email");
      return nativeSerialization;
    },
  });

  mockSubmit(wrapper);
  t.equal(data["email"], "picard@starfleet.gov");
  t.end();
});

tap.test("it passes a successful response to props.onSuccess", t => {
  t.plan(2);
  function handleSuccess(res) {
    t.assert(res instanceof XMLHttpRequest, 'response is an XHR');
    t.equal(res.status, 200, 'response has status 200');
  }
  const wrapper = renderForm({ onSuccess: handleSuccess });
  mockSubmit(wrapper);
});

tap.test("it re-enables itself after a successful response", t => {
  t.plan(2);
  let responseCount = 0;
  const wrapper = renderForm({
    onSuccess: res => {
      responseCount += 1;
      if (responseCount == 1) {
        t.equal(res.status, 200, 'sent once');
        mockSubmit(wrapper);
      } else {
        t.equal(responseCount, 2, 'sent twice');
      }
    }
  });
  mockSubmit(wrapper);
});

tap.test("it passes an unsuccessful response to props.onError", t => {
  t.plan(2);
  function handleError(res) {
    t.assert(res instanceof XMLHttpRequest, 'response is an XHR')
    t.equal(res.status, 500, 'response has status 500');
  }
  const wrapper = renderForm({ action: "/error", onError: handleError });
  mockSubmit(wrapper);
});

tap.test("it re-enables itself after a failed response", t => {
  t.plan(2);
  let responseCount = 0;
  const wrapper = renderForm({
    action: "/error",
    onError: res => {
      responseCount += 1;
      if (responseCount == 1) {
        t.equal(res.status, 500, 'sent once');
        mockSubmit(wrapper);
      } else {
        t.equal(responseCount, 2, 'sent twice');
      }
    }
  });
  mockSubmit(wrapper);
});

tap.test(
  "it can customize network requests via props.beforeSend",
  t => {
    t.plan(2);
    const wrapper = renderForm({
      beforeSend: xhr => {
        xhr.withCredentials = true;
        xhr.setRequestHeader("Authorization", "Bearer 12345");
        t.assert(xhr.withCredentials, 'sent custom request');
      },
      onSuccess: res => {
        const json = JSON.parse(res.responseText);
        t.assert(json["authorization"], 'received custom response');
      }
    });
    mockSubmit(wrapper);
  }
);

tap.test(
  "it can send data via props.send instead of via a private XHR",
  t => {
    t.plan(2);
    function mockFetch(url, options) {
      return new Promise((resolve, reject) => {
        resolve(options.headers)
      })
    }
    const wrapper = renderForm({
      send: (payload, instance) => {
        t.assert(typeof payload === 'string', 'payload is serialized data');
        return mockFetch(instance.props.action, {
          headers: { 'Authorization': 'Bearer 12345' }
        })
      },
      onSuccess: res => {
        t.assert(res['Authorization'])
      }
    });
    mockSubmit(wrapper);
  }
);

tap.test("it does not submit when props.onSubmit returns false", t => {
  var count = 0;
  const wrapper = renderForm({
    onSubmit: (event, payload) => {
      const valid = new FormData(event.target).has("password_confirmation");
      if (valid) {
        count += 1;
      } else {
        return false;
      }
    },
  });
  mockSubmit(wrapper);
  t.equal(wrapper.state("disabled"), false, 'form is not be disabled');
  t.equal(count, 0, 'form did not submit');
  t.end();
});

tap.test("it passes extra props into the rendered form element", t => {
  const wrapper = renderForm({
    className: "fancy",
    "data-role": "auth"
  });
  t.equal(wrapper.find("form.fancy").length, 1, 'CSS classes');
  t.equal(wrapper.find('form[data-role="auth"]').length, 1, 'arbitrary attrs');
  t.end();
});
