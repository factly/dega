import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from '@testing-library/react';
import { Form } from 'antd';

import '../../../matchMedia.mock';
import MenuField from './MenuField';

describe('MenuField component', () => {
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component = shallow(
          <Form>
            <MenuField field={[]} />
          </Form>,
        );
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    it('should handle input name change', () => {
      let component;
      const field = {
        fieldKey: '1',
        name: '1',
      };
      act(() => {
        component = mount(
          <Form>
            <MenuField field={field} />
          </Form>,
        );
      });
      component
        .find('FormItem')
        .at(0)
        .find('Input')
        .simulate('change', { target: { value: 'New name' } });
      expect(component.find('CollapsePanel').at(1).props().header).toBe('New name');
      component.unmount();
    });
  });
});
