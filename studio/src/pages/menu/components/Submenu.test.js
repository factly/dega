import React from 'react';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import { Form } from 'antd';

import '../../../matchMedia.mock';
import Submenu from './Submenu';
import MenuField from './MenuField';
import { MinusCircleOutlined } from '@ant-design/icons';

describe('Submenu component', () => {
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component = mount(
          <Form>
            <Submenu fieldKey="1" />
          </Form>,
        );
      });
      expect(component).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    it('should add field on click of button', () => {
      let component;
      act(() => {
        component = mount(
          <Form>
            <Submenu fieldKey="1" />
          </Form>,
        );
      });
      const total_menuFields = component.find(MenuField).length;
      const addButton = component.find('Button');
      addButton.simulate('click');
      expect(component.find(MenuField).length).toBe(total_menuFields + 1);
    });
    it('should remove field on click of button', () => {
      let component;
      act(() => {
        component = mount(
          <Form>
            <Submenu fieldKey="1" />
          </Form>,
        );
      });
      component.find('Button').simulate('click');
      const total_menuFields = component.find(MenuField).length;
      const removeButton = component.find(MinusCircleOutlined);
      removeButton.simulate('click');
      expect(component.find(MenuField).length).toBe(total_menuFields - 1);
    });
  });
});
