import tap from 'tap';
import { serializeToArray } from '../src/utils';
import qs from 'qs';
import './dom';

tap.test('it serializes nested forms', t => {
  const form = document.createElement('form')
  form.innerHTML = `
    <p>
      <label>Title</label>
      <input type="text" name="title" value="Secret" />
    </p>
    <p>
      <label>Password</label>
      <input type="password" name="password" value="password" />
    </p>
    <p>
      <label>Status</label>
      <select name="status">
        <option value="published">Published</option>
        <option selected value="draft">Draft</option>
      </select>
    </p>
    <p>
      <label>Categories</label>
      <select multiple name="categories[]">
        <option selected value="art">Art</option>
        <option selected value="life">Life</option>
      </select>
    </p>
    <div>
      <label>
        <input type="radio" value="good" name="ethics" />
         Good
       </label>
        <input checked type="radio" value="evil" name="ethics" />
         Evil
       </label>
     </div>
    <div>
      <h3>Tags</h3>
      <label>
        <input checked type="checkbox" value="N" name="tags[]" />
         North
       </label>
        <input checked type="checkbox" value="E" name="tags[]" />
         East
       </label>
      <label>
        <input type="checkbox" value="S" name="tags[]" />
         South
       </label>
      <label>
        <input type="checkbox" value="W" name="tags[]" />
         West
       </label>
    </div>
  `;

  const fields = serializeToArray(form);
  const serialized = fields.map(([key, val]) => `${key}=${val}`).join('&')
  const data = qs.parse(serialized);
  t.equal(data.title, 'Secret', '<input type="text" />');
  t.equal(data.password, 'password', '<input type="password" />');
  t.equal(data.status, 'draft', "<select>");
  t.deepEqual(data.categories, ['art', 'life'], "<select multiple>");
  t.deepEqual(data.tags, ['N', 'E'], '<input type="checkbox" />');
  t.equal(data.ethics, 'evil', '<input type="radio" />');
  t.end();
});
