import React from 'react';
import { shallow } from 'enzyme';
import { act } from '@testing-library/react';
import Website from '.';
import '../../matchMedia.mock';

describe('website component', () => {
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let component;
      act(() => {
        component = shallow(<Website />);
      });
      expect(component).toMatchSnapshot();
      act(() => component.unmount());
    });
  });
});
