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
  t.equal(wrapper.state("disabled"), true);
  t.equal(wrapper.find("form[data-disabled=true]").length, 1);
  t.equal(submissionCount, 1);

  wrapper.find("form").simulate("submit");
  t.equal(submissionCount, 1);
  t.end();
});

tap.test("it calls props.onSubmit with data when submitted", t => {
  let submitted = false;

  function handleSubmit(data) {
    submitted = data;
  }

  const wrapper = renderForm({ onSubmit: handleSubmit });
  mockSubmit(wrapper);
  t.assert(submitted instanceof FormData);
  t.end();
});

tap.test("it accepts a custom `serialize` fn", t => {
  let data = {};

  const wrapper = renderForm({
    serialize: formElement => {
      const nativeSerialization = new FormData(formElement);
      data["email"] = nativeSerialization.get("email");
      return nativeSerialization;
    }
  });

  mockSubmit(wrapper);
  t.equal(data["email"], "picard@starfleet.gov");
  t.end();
});

tap.test("it passes a successful response to props.onSuccess", t => {
  t.plan(1);
  function handleSuccess(res) {
    t.assert(res);
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
        t.equal(res.status, 200);
        mockSubmit(wrapper);
      } else {
        t.equal(responseCount, 2);
      }
    }
  });
  mockSubmit(wrapper);
});

tap.test("it passes an unsuccessful  response to props.onError", t => {
  t.plan(1);
  function handleError(res) {
    t.equal(res.status, 500);
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
        t.equal(res.status, 500);
        mockSubmit(wrapper);
      } else {
        t.equal(responseCount, 2);
      }
    }
  });
  mockSubmit(wrapper);
});

tap.test(
  "it can customize network requests via props.send and sendWithXHR",
  t => {
    t.plan(2);
    const wrapper = renderForm({
      send: networkProps => {
        return sendWithXHR({
          ...networkProps,
          prepare: xhr => {
            xhr.withCredentials = true;
            xhr.setRequestHeader("Authorization", "Bearer 12345");
            t.assert(xhr.withCredentials);
          }
        });
      },
      onSuccess: res => {
        const json = JSON.parse(res.responseText);
        t.assert(json["authorization"]);
      }
    });
    mockSubmit(wrapper);
  }
);

tap.test("it acceps a custom validate function", t => {
  var submissionCount = 0;
  const wrapper = renderForm({
    validate: formData => {
      return formData.has("password_confirmation");
    },
    onSubmit: () => {
      submissionCount += 1;
    }
  });
  mockSubmit(wrapper);
  t.equal(wrapper.state("disabled"), false);
  t.equal(submissionCount, 0);
  t.end();
});

tap.test("it passes extra props into the rendered form element", t => {
  const wrapper = renderForm({
    className: "fancy",
    "data-role": "auth"
  });
  t.equal(wrapper.find("form.fancy").length, 1);
  t.equal(wrapper.find('form[data-role="auth"]').length, 1);
  t.end();
});
