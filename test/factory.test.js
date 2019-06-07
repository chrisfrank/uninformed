import tap from 'tap';
import React from 'react';
import { shallow } from 'enzyme';
import { html } from './helper';
import { createForm } from '../dist/factory';

tap.test('it creates a Form component', t => {
  const Form = createForm(React);
  const dom = shallow(
    html`
      <${Form} action="/wherever" method="POST">
        <input type="text" name="etc" />
      <//>
    `
  )
  t.equal(dom.find('form').length, 1, 'rendered without crashing')
  t.end()
})
