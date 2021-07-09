import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import { Steps, DatePicker, Input } from 'antd';
import moment from 'moment';
import { MinusCircleOutlined } from '@ant-design/icons';

import '../../../matchMedia.mock';
import ClaimCreateForm from './ClaimForm';
import { addClaimant } from '../../../actions/claimants';

jest.mock('@editorjs/editorjs');
jest.mock('../../../actions/claimants', () => ({
  ...jest.requireActual('../../../actions/claimants'),
  addClaimant: jest.fn(),
}));

const data = {
  claim: 'title',
  slug: 'slug',
  claimant: 1,
  rating: 1,
  claim_date: moment(new Date('2020-12-12')),
  checked_date: moment(new Date('2020-12-12')),
  claim_sources: 'claim_sources',
  fact: 'review',
  review_tag_line: 'review_tag_line',
  review_sources: 'review_sources',
  description: {
    time: 1595747741807,
    blocks: [
      {
        type: 'header',
        data: {
          text: 'Editor.js',
          level: 2,
        },
      },
      {
        type: 'paragraph',
        data: {
          text:
            'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
        },
      },
    ],
    version: '2.18.0',
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Claims Create Form component', () => {
  store = mockStore({
    claims: {
      req: [],
      details: {},
      loading: true,
    },
    claimants: {
      req: [],
      details: {},
      loading: true,
    },
    rating: {
      req: [],
      details: {},
      loading: true,
    },
    media: {
      req: [],
      details: {},
      loading: true,
    },
  });
  useDispatch.mockReturnValue(jest.fn(() => Promise.resolve({})));
  useSelector.mockImplementation((state) => ({ details: [], total: 0, loading: false }));

  describe('snapshot testing', () => {
    beforeEach(() => {
      onCreate = jest.fn();
      onCreate.mockImplementationOnce(
        (values) => new Promise((resolve, reject) => resolve(values)),
      );
    });
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <ClaimCreateForm />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component in all steps', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <ClaimCreateForm data={data} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
      act(() => {
        const nextButton = tree.find('Button').at(3);
        nextButton.simulate('click');
      });
      tree.update();
      expect(tree.find(Steps).props().current).toEqual(1);
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <ClaimCreateForm onCreate={onCreate} data={data} />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
      act(() => {
        const nextButton = tree.find('Button').at(3);
        nextButton.simulate('click');
      });
      tree.update();
      expect(tree.find(Steps).props().current).toEqual(1);
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper, props;
    beforeEach(() => {
      props = {
        onCreate: jest.fn(),
        data: data,
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ClaimCreateForm {...props} />
          </Provider>,
        );
      });
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should not submit form with empty data', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ClaimCreateForm onCreate={props.onCreate} />
          </Provider>,
        );
      });

      act(() => {
        const submitButtom = wrapper.find('Button').at(3);
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should submit form with given data', (done) => {
      act(() => {
        const nextButton = wrapper.find('Button').at(3);
        nextButton.simulate('click');
      });
      wrapper.update();
      act(() => {
        const submitButtom = wrapper.find('Button').at(3);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
      });
      wrapper.update();

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          claim: 'title',
          slug: 'slug',
          claimant: 1,
          claimant_id: 1,
          rating: 1,
          rating_id: 1,
          claim_date: moment(new Date('2020-12-12')).format('YYYY-MM-DDTHH:mm:ssZ'),
          checked_date: moment(new Date('2020-12-12')).format('YYYY-MM-DDTHH:mm:ssZ'),
          claim_sources: 'claim_sources',
          fact: 'review',
          review_sources: 'review_sources',
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Editor.js',
                  level: 2,
                },
              },
              {
                type: 'paragraph',
                data: {
                  text:
                    'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
                },
              },
            ],
            version: '2.18.0',
          },
        });
        done();
      }, 0);
    });
    it('should submit form with new name', (done) => {
      const data2 = { ...data, id: 1 };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ClaimCreateForm onCreate={props.onCreate} data={data2} />
          </Provider>,
        );
      });
      act(() => {
        const input = wrapper.find('FormItem').at(0).find('TextArea').at(0);
        input.simulate('change', {
          target: {
            value:
              'new name new claim title for testing claim update and testing slug update. slug maker should take only first one hundred and fifty characters to create a slug and not all characters from title, since claim title can be  more than 150',
          },
        });

        const submitButtom = wrapper.find('Button').at(3);
        expect(submitButtom.text()).toBe('Next');
        submitButtom.simulate('click');
      });
      wrapper.update();
      act(() => {
        const submitButtom = wrapper.find('Button').at(3);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          claim:
            'new name new claim title for testing claim update and testing slug update. slug maker should take only first one hundred and fifty characters to create a slug and not all characters from title, since claim title can be  more than 150',
          slug:
            'new-name-new-claim-title-for-testing-claim-update-and-testing-slug-update-slug-maker-should-take-only-first-one-hundred-and-fifty-characters-to-creat',
          claimant: 1,
          claimant_id: 1,
          rating: 1,
          rating_id: 1,
          claim_date: moment(new Date('2020-12-12')).format('YYYY-MM-DDTHH:mm:ssZ'),
          checked_date: moment(new Date('2020-12-12')).format('YYYY-MM-DDTHH:mm:ssZ'),
          claim_sources: 'claim_sources',
          fact: 'review',
          review_sources: 'review_sources',
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Editor.js',
                  level: 2,
                },
              },
              {
                type: 'paragraph',
                data: {
                  text:
                    'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
                },
              },
            ],
            version: '2.18.0',
          },
        });
        done();
      }, 0);
    });
    it('should submit form with updated data', (done) => {
      const newDescription = {
        time: 1595747741807,
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Editor.js',
              level: 2,
            },
          },
          {
            type: 'paragraph',
            data: {
              text: 'updated description',
            },
          },
        ],
        version: '2.18.0',
      };
      act(() => {
        wrapper
          .find('FormItem')
          .at(5)
          .find('Editor')
          .at(0)
          .props()
          .onChange({ target: { value: newDescription } });
        wrapper
          .find('FormItem')
          .at(0)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'new name' } });
        wrapper
          .find('FormItem')
          .at(1)
          .find('Input')
          .simulate('change', { target: { value: 'new-slug' } });
        wrapper
          .find('FormItem')
          .at(3)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 2 } });
        wrapper
          .find('FormItem')
          .at(4)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 3 } });
        wrapper
          .find('FormItem')
          .at(6)
          .find(DatePicker)
          .at(0)
          .props()
          .onChange({ target: { value: moment(new Date('2020-01-01')) } });
        wrapper
          .find('FormItem')
          .at(7)
          .find(DatePicker)
          .at(0)
          .props()
          .onChange({ target: { value: moment(new Date('2020-04-04')) } });
        wrapper
          .find('FormItem')
          .at(2)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'new review' } });
        const submitButtom = wrapper.find('Button').at(3);
        expect(submitButtom.text()).toBe('Next');
        submitButtom.simulate('click');
      });
      wrapper.update();

      act(() => {
        const submitButtom = wrapper.find('Button').at(3);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          claim: 'new name',
          slug: 'new-slug',
          claimant: 2,
          claimant_id: 2,
          rating: 3,
          rating_id: 3,
          claim_date: moment(new Date('2020-01-01')).format('YYYY-MM-DDTHH:mm:ssZ'),
          checked_date: moment(new Date('2020-04-04')).format('YYYY-MM-DDTHH:mm:ssZ'),
          claim_sources: 'claim_sources',
          fact: 'new review',
          review_sources: 'review_sources',
          description: newDescription,
        });
        done();
      }, 0);
    });
    it('should handle next and back buttons', () => {
      act(() => {
        const nextButton = wrapper.find('Button').at(3);
        nextButton.simulate('click');
      });
      wrapper.update();
      expect(wrapper.find(Steps).props().current).toEqual(1);

      act(() => {
        const prevButton = wrapper.find('Button').at(2);
        prevButton.simulate('click');
      });
      wrapper.update();
      expect(wrapper.find(Steps).props().current).toEqual(0);
    });
    it('should add review sources input field on button click', () => {
      const formListInputCount = wrapper.find('FormList').find('Input').length;
      expect(formListInputCount).toBe(0);
      act(() => {
        const button = wrapper.find('FormItem').at(10).find('Button').at(0);
        expect(button.text()).toBe('Add Review sources');
        button.simulate('click');
      });
      wrapper.update();
      expect(wrapper.find('FormList').find('Input').length).not.toBe(0);
    });
    it('should remove review sources input field on button click', () => {
      act(() => {
        const button = wrapper.find('FormItem').at(10).find('Button');
        expect(button.text()).toBe('Add Review sources');
        button.simulate('click');
      });
      wrapper.update();
      const formInputFieldCount = wrapper.find('FormList').find(Input).length;
      act(() => {
        wrapper.find('FormList').find(MinusCircleOutlined).at(0).simulate('click');
      });
      wrapper.update();
      expect(wrapper.find('FormList').find(Input).length).toBe(formInputFieldCount - 2);
    });
    it('should add claim sources input field on button click', () => {
      const formListInputCount = wrapper.find('FormList').find('Input').length;
      expect(formListInputCount).toBe(0);
      act(() => {
        const button = wrapper.find('FormItem').at(9).find('Button').at(0);
        expect(button.text()).toBe('Add Claim sources');
        button.simulate('click');
      });
      wrapper.update();
      expect(wrapper.find('FormList').find('Input').length).not.toBe(0);
    });
    it('should remove claim sources input field on button click', () => {
      act(() => {
        const button = wrapper.find('FormItem').at(9).find('Button');
        expect(button.text()).toBe('Add Claim sources');
        button.simulate('click');
      });
      wrapper.update();
      const formInputFieldCount = wrapper.find('FormList').find(Input).length;
      act(() => {
        wrapper.find('FormList').find(MinusCircleOutlined).at(0).simulate('click');
      });
      wrapper.update();
      expect(wrapper.find('FormList').find(Input).length).toBe(formInputFieldCount - 2);
    });
    it('should submit with no dates', (done) => {
      const data2 = {
        claim: 'title',
        slug: 'slug',
        claimant: 1,
        rating: 1,
        claim_sources: 'claim_sources',
        fact: 'review',
        review_sources: 'review_sources',
        description: {
          time: 1595747741807,
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Editor.js',
                level: 2,
              },
            },
            {
              type: 'paragraph',
              data: {
                text:
                  'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
              },
            },
          ],
          version: '2.18.0',
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ClaimCreateForm data={data2} onCreate={props.onCreate} />
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(3);
        expect(submitButtom.text()).toBe('Next');
        submitButtom.simulate('click');
      });
      wrapper.update();
      act(() => {
        const submitButtom = wrapper.find('Button').at(3);
        expect(submitButtom.text()).toBe('Submit');
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          claim: 'title',
          slug: 'slug',
          claimant: 1,
          claimant_id: 1,
          rating: 1,
          rating_id: 1,
          claim_date: null,
          checked_date: null,
          claim_sources: 'claim_sources',
          fact: 'review',
          review_sources: 'review_sources',
          description: {
            time: 1595747741807,
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Editor.js',
                  level: 2,
                },
              },
              {
                type: 'paragraph',
                data: {
                  text:
                    'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
                },
              },
            ],
            version: '2.18.0',
          },
        });
        done();
      }, 0);
    });
    it('should handle step change', () => {
      act(() => {
        wrapper.find('Steps').at(0).props().onChange(1);
      });
      wrapper.update();
      expect(wrapper.find(Steps).props().current).toEqual(1);
    });
    it('should not submit with empty url for review sources', (done) => {
      const data2 = {
        id: 1,
        claim: 'title',
        slug: 'slug',
        claimant: 1,
        rating: 1,
        claim_sources: 'claim_sources',
        fact: 'review',
        description: {
          time: 1595747741807,
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Editor.js',
                level: 2,
              },
            },
            {
              type: 'paragraph',
              data: {
                text:
                  'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
              },
            },
          ],
          version: '2.18.0',
        },
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <ClaimCreateForm data={data2} onCreate={props.onCreate} />
          </Provider>,
        );
      });
      const formListInputCount = wrapper.find('FormList').find('Input').length;
      expect(formListInputCount).toBe(0);
      act(() => {
        const button = wrapper.find('FormItem').at(10).find('Button').at(0);
        expect(button.text()).toBe('Add Review sources');
        button.simulate('click');
      });
      wrapper.update();
      act(() => {
        const submitButtom = wrapper.find('Button').at(3);
        submitButtom.simulate('click');
      });
      wrapper.update();

      act(() => {
        const submitButtom = wrapper.find('Button').at(3);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(0);
        done();
      }, 0);
    });
  });
});
