import { createElement } from 'react';
import htm from 'htm';
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

// wire enzyme to react-16
configure({ adapter: new Adapter() })

export const html = htm.bind(createElement)
