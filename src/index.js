import React from 'react';
import { createForm } from './factory';
export const Form = createForm(React);
export { sendWithXHR, serializeWithFormData } from './utils';
