import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { Collapse, Dropdown } from 'antd';

import '../../../matchMedia.mock';
import FactCheckForm from './FactCheckForm';

import { addTemplate } from '../../../actions/posts';
import { addClaim } from '../../../actions/claims';

Date.now = jest.fn(() => 1487076708000);
jest.mock('@editorjs/editorjs');
jest.mock('react-monaco-editor', () => {
  const MonacoEditor = () => <div />;
  return MonacoEditor;
});

jest.mock('./../../../actions/sidebar', () => ({
  setCollapse: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));
jest.mock('../../../actions/posts', () => ({
  addTemplate: jest.fn(),
}));
jest.mock('../../../actions/claims', () => ({
  ...jest.requireActual('../../../actions/claims'),
  addClaim: jest.fn(),
  getClaims: jest.fn(),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('./ClaimList', () => {
  const ClaimList = () => <div />;
  return ClaimList;
});
const format = {
  id: 2,
  name: 'Fact Check',
  slug: 'fact-check',
};

const data = {
  id: 1,
  title: 'FactCheck-1',
  excerpt: 'excerpt of factcheck',
  slug: 'factcheck-1',
  featured_medium_id: 1,
  status: 'draft',
  format: 2,
  categories: [1],
  tags: [1],
  authors: [1],
  claims: [1],
  claim_order: [1],
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

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let onCreate, store;

describe('Fact-check form component', () => {
  store = mockStore({
    posts: {
      req: [],
      details: {},
      loading: true,
    },
    formats: {
      req: [],
      details: {
        1: {
          name: 'Fact check',
          slug: 'fact-check',
        },
      },
      loading: true,
    },
    authors: {
      req: [],
      details: {},
      loading: true,
    },
    tags: {
      req: [],
      details: {},
      loading: true,
    },
    claimants: {
      req: [],
      details: {},
      loading: true,
    },
    claims: {
      req: [
        {
          data: [1, 2],
          total: 2,
          query: {
            page: 1,
          },
        },
      ],
      details: {
        1: {
          id: 1,
          claim: 'Claim 1',
        },
        2: {
          id: 2,
          claim: 'Claim 2',
        },
      },
      loading: false,
    },
    ratings: {
      req: [],
      details: {},
      loading: true,
    },
    media: {
      req: [],
      details: {
        1: {
          name: 'Sample Image',
          slug: 'sample-img',
        },
      },
      loading: true,
    },
    sidebar: {
      collapsed: false,
    },
  });
  useDispatch.mockReturnValue(jest.fn(() => Promise.resolve({})));
  useSelector.mockImplementation((state) => ({
    details: [],
    total: 0,
    loading: false,
    sidebar: false,
  }));

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
            <Router>
              <FactCheckForm actions={['publish']} />
            </Router>
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with data', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <Router>
              <FactCheckForm
                actions={['publish']}
                onCreate={onCreate}
                data={data}
                format={format}
              />
            </Router>
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match component with open drawer', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <Router>
              <FactCheckForm
                actions={['publish']}
                onCreate={onCreate}
                data={data}
                format={format}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const settingButton = tree.find('Button').at(3);
        expect(settingButton.text()).toBe('');
        settingButton.simulate('click');
        expect(tree.find('Drawer').length).not.toBe(0);
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match with different permission actions', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <Router>
              <FactCheckForm actions={['create']} data={data} onCreate={onCreate} format={format} />
            </Router>
          </Provider>,
        );
      });
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
            <Router>
              <FactCheckForm
                actions={['publish']}
                {...props}
                format={{ id: 1, name: 'article', slug: 'article' }}
              />
            </Router>
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
            <Router>
              <FactCheckForm actions={['publish']} onCreate={props.onCreate} />
            </Router>
          </Provider>,
        );
      });

      act(() => {
        //submit button
        const submitButtom = wrapper.find('Button').at(0);
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).not.toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should submit form with given data', (done) => {
      act(() => {
        const settingButton = wrapper.find('Button').at(3);
        expect(settingButton.text()).toBe('');
        settingButton.simulate('click');
      });
      wrapper.update();
      act(() => {
        wrapper
          .find('FormItem')
          .at(8)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: [3] } });
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Save');
        submitButtom.simulate('click');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'FactCheck-1',
          excerpt: 'excerpt of factcheck',
          slug: 'factcheck-1',
          featured_medium_id: 1,
          status: 'draft',
          format_id: 1,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          published_date: null,
          tag_ids: [1],
          tags: [1],
          claims: [3],
          claim_ids: [],
          claim_order: [],
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
    it('should submit form with title change', (done) => {
      act(() => {
        wrapper
          .find('FormItem')
          .at(4)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'New Title' } });
      });
      act(() => {
        const settingButton = wrapper.find('Button').at(3);
        expect(settingButton.text()).toBe('');
        settingButton.simulate('click');
        wrapper
          .find('FormItem')
          .at(8)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: [1, 3] } });
      });
      act(() => {
        const dropdown = wrapper.find(Dropdown);
        dropdown.simulate('mouseover');
        const overlay = dropdown.props().overlay;
        overlay.props.children.props.children[1].props.onChange(true);
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Save');
        submitButtom.simulate('click');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'New Title',
          excerpt: 'excerpt of factcheck',
          slug: 'new-title',
          featured_medium_id: 1,
          status: 'ready',
          format_id: 1,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          published_date: null,
          tag_ids: [1],
          tags: [1],
          claims: [1, 3],
          claim_order: [1, 3],
          claim_ids: [1, 3],
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
    it('should create template on click of Add template button', (done) => {
      addTemplate.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <FactCheckForm actions={['publish']} {...props} format={format} />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const templateButtom = wrapper.find('Button').at(0);
        templateButtom.simulate('click');
        wrapper.update();
      });

      setTimeout(() => {
        expect(addTemplate).toHaveBeenCalledTimes(1);
        expect(addTemplate).toHaveBeenCalledWith({
          post_id: 1,
        });
        expect(push).toHaveBeenCalledWith('/fact-checks');
        done();
      }, 0);
    });
    it('should add claim', (done) => {
      useSelector.mockImplementationOnce(() => ({
        claims: {
          req: [
            {
              data: [1, 2],
              total: 2,
              query: {
                page: 1,
              },
            },
          ],
          loading: false,
          details: {
            1: {
              id: 1,
              claim: 'Claim 1',
            },
            2: {
              id: 2,
              claim: 'Claim 2',
            },
          },
        },
        total: 2,
        loading: false,
      }));

      act(() => {
        const addClaimButton = wrapper.find('FormItem').at(8).find('Button');
        expect(addClaimButton.text()).toBe('Add Claim');
        addClaimButton.simulate('click');
      });
      wrapper.update();
      act(() => {
        wrapper.find(Collapse).at(0).props().onChange();
        wrapper.find(Collapse).at(1).props().onChange();
      });
      wrapper.update();

      act(() => {
        const claimForm = wrapper.find('Modal');
        claimForm
          .find('FormItem')
          .at(0)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'Claim title' } });
        claimForm
          .find('FormItem')
          .at(3)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 1 } });
        claimForm
          .find('FormItem')
          .at(4)
          .find('Select')
          .at(0)
          .props()
          .onChange({ target: { value: 1 } });

        const nextButton = claimForm.find('Button').at(2);
        expect(nextButton.text()).toBe('Submit');
        nextButton.simulate('submit');
      });
      setTimeout(() => {
        expect(addClaim).toHaveBeenCalled();
        expect(addClaim).toHaveBeenCalledWith({
          checked_date: null,
          claim_date: null,
          claim_sources: undefined,
          claimant: 1,
          claimant_id: 1,
          description: undefined,
          rating: 1,
          rating_id: 1,
          fact: undefined,
          review_sources: undefined,
          review_tag_line: undefined,
          slug: 'claim-title',
          claim: 'Claim title',
          meta_fields: undefined,
        });
        done();
      }, 0);
    });
    it('should handle cancel click of Modal', () => {
      act(() => {
        const addClaimButton = wrapper.find('FormItem').at(8).find('Button');
        expect(addClaimButton.text()).toBe('Add Claim');
        addClaimButton.simulate('click');
      });
      wrapper.update();
      act(() => {
        wrapper.find(Collapse).at(0).props().onChange();
        wrapper.find(Collapse).at(1).props().onChange();
      });
      wrapper.update();
      const okButton = wrapper.find('Modal').find('Button').at(3);
      expect(okButton.text()).toBe('Cancel');
      okButton.simulate('click');
      expect(wrapper.find('Modal').at(0).props().visible).toBe(false);
    });
    it('should handle ok click of Modal', () => {
      act(() => {
        const addClaimButton = wrapper.find('FormItem').at(8).find('Button');
        expect(addClaimButton.text()).toBe('Add Claim');
        addClaimButton.simulate('click');
      });
      wrapper.update();
      act(() => {
        wrapper.find(Collapse).at(0).props().onChange();
        wrapper.find(Collapse).at(1).props().onChange();
      });
      wrapper.update();
      const okButton = wrapper.find('Modal').find('Button').at(4);
      expect(okButton.text()).toBe('OK');
      okButton.simulate('click');
      expect(wrapper.find('Modal').at(0).props().visible).toBe(false);
    });
    it('should open and close drawer for settings', () => {
      act(() => {
        const settingButton = wrapper.find('Button').at(3);
        expect(settingButton.text()).toBe('');
        settingButton.simulate('click');
        expect(wrapper.find('Drawer').length).not.toBe(0);
        const closeButtonn = wrapper.find('DrawerChild').find('button').at(0);
        closeButtonn.simulate('click');
      });
    });
    it('should not change slug with title change when status is publish', (done) => {
      const data2 = {
        id: 1,
        title: 'FactCheck-1',
        excerpt: 'excerpt of factcheck',
        slug: 'factcheck-1',
        featured_medium_id: 1,
        status: 'publish',
        format: 2,
        published_date: moment(new Date('2020-12-12')).format('YYYY-MM-DDTHH:mm:ssZ'),
        categories: [1],
        tags: [1],
        authors: [1],
        claims: [1],
        claim_order: [1],
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
            <Router>
              <FactCheckForm
                actions={['publish']}
                data={data2}
                format={format}
                onCreate={props.onCreate}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        wrapper
          .find('FormItem')
          .at(4)
          .find('TextArea')
          .at(0)
          .simulate('change', { target: { value: 'New Title' } });
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(2);
        expect(submitButtom.text()).toBe('Update');
        submitButtom.simulate('click');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'New Title',
          excerpt: 'excerpt of factcheck',
          slug: 'factcheck-1',
          featured_medium_id: 1,
          status: 'publish',
          format_id: 2,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          published_date: moment(new Date('2020-12-12')).format('YYYY-MM-DDTHH:mm:ssZ'),
          tag_ids: [1],
          tags: [1],
          claims: [1],
          claim_order: [1],
          claim_ids: [1],
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
    it('should submit with no tags, no categories, no claims, no authors', (done) => {
      const data2 = {
        id: 1,
        title: 'FactCheck-1',
        excerpt: 'excerpt of factcheck',
        slug: 'factcheck-1',
        featured_medium_id: 1,
        status: 'draft',
        format: 2,
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
            <Router>
              <FactCheckForm
                actions={['publish']}
                data={data2}
                format={format}
                onCreate={props.onCreate}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Save');
        submitButtom.simulate('submit');
        wrapper.update();
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'FactCheck-1',
          excerpt: 'excerpt of factcheck',
          slug: 'factcheck-1',
          featured_medium_id: 1,
          status: 'draft',
          format_id: 2,
          author_ids: [],
          category_ids: [],
          tag_ids: [],
          published_date: null,
          claim_ids: [],
          claim_order: [],
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
    it('should set status as publish on click and submit', (done) => {
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <FactCheckForm
                actions={['publish']}
                onCreate={props.onCreate}
                data={data}
                format={format}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const submitButtom = wrapper.find('Button').at(2);
        expect(submitButtom.text()).toBe('Publish');
        submitButtom.simulate('click');
        submitButtom.simulate('submit');
      });

      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'FactCheck-1',
          excerpt: 'excerpt of factcheck',
          slug: 'factcheck-1',
          featured_medium_id: 1,
          status: 'publish',
          format_id: 2,
          author_ids: [1],
          authors: [1],
          published_date: moment(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ'),
          categories: [1],
          category_ids: [1],
          tag_ids: [1],
          tags: [1],
          claims: [1, undefined],
          claim_ids: [1],
          claim_order: [1],
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
    it('should add meta data', (done) => {
      const data2 = { ...data };
      data2.meta_fields = {
        sample: 'testing1',
      };
      data2.meta = {
        meta: 'data1',
      };
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <FactCheckForm
                actions={['publish']}
                onCreate={props.onCreate}
                data={data2}
                format={{ id: 1, name: 'article', slug: 'article' }}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const settingButton = wrapper.find('Button').at(3);
        expect(settingButton.text()).toBe('');
        settingButton.simulate('click');
        expect(wrapper.find('Drawer').length).not.toBe(0);
      });
      wrapper.update();
      act(() => {
        const addMetaDataBtn = wrapper.find('FormItem').at(16).find('Button').at(0);
        expect(addMetaDataBtn.text()).toBe('Add Meta Data');
        addMetaDataBtn.simulate('click');
      });

      act(() => {
        const metaFieldData = wrapper.find('FormItem').at(19).find('MonacoEditor');
        metaFieldData.props().onChange({
          target: { value: '{"sample":"testing"}' },
        });
        const metaData = wrapper.find('FormItem').at(20).find('MonacoEditor');
        metaData.props().onChange({
          target: { value: '{"meta":"data"}' },
        });
      });

      act(() => {
        const backBtn = wrapper.find('FormItem').at(18).find('Button').at(0);
        expect(backBtn.text()).toBe('Back');
        backBtn.simulate('click');

        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Save');
        submitButtom.simulate('click');
        submitButtom.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'FactCheck-1',
          excerpt: 'excerpt of factcheck',
          slug: 'factcheck-1',
          featured_medium_id: 1,
          status: 'draft',
          format_id: 1,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          published_date: null,
          tag_ids: [1],
          tags: [1],
          claims: [1, undefined],
          claim_ids: [1],
          claim_order: [1],
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
          meta: {
            meta: 'data',
          },
          meta_fields: {
            sample: 'testing',
          },
        });
        done();
      }, 0);
    });
    it('should add header and footer code', (done) => {
      const data2 = { ...data };
      data2.header_code = `""use strict";↵↵class Chuck {↵    greet() {↵        var a,b;↵        a=5;↵        b=6;↵        return 'Hello'+ (a+b).toString();↵    }↵}"`;
      data2.footer_code = `{↵    "info":"data",↵    "extra":"pqrstuv"↵}`;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <FactCheckForm
                actions={['publish']}
                onCreate={props.onCreate}
                data={data2}
                format={{ id: 1, name: 'article', slug: 'article' }}
              />
            </Router>
          </Provider>,
        );
      });
      act(() => {
        const settingButton = wrapper.find('Button').at(3);
        expect(settingButton.text()).toBe('');
        settingButton.simulate('click');
        expect(wrapper.find('Drawer').length).not.toBe(0);
      });
      wrapper.update();
      act(() => {
        const addMetaDataBtn = wrapper.find('FormItem').at(17).find('Button').at(0);
        expect(addMetaDataBtn.text()).toBe('Code Injection');
        addMetaDataBtn.simulate('click');
      });

      act(() => {
        wrapper
          .find('FormItem')
          .at(22)
          .find('Select')
          .props()
          .onChange({ target: { value: 'typescript' } });

        const headerData = wrapper.find('FormItem').at(23).find('MonacoEditor');
        headerData.props().onChange({
          target: {
            value: `""use strict";↵↵class Chuck {↵    greet() {↵        return 'Hello';↵    }↵}"`,
          },
        });

        wrapper
          .find('FormItem')
          .at(24)
          .find('Select')
          .props()
          .onChange({ target: { value: 'json' } });

        const footerData = wrapper.find('FormItem').at(25).find('MonacoEditor');
        footerData.props().onChange({
          target: { value: '{↵    "info":"data",↵}' },
        });
      });
      act(() => {
        const backBtn = wrapper.find('FormItem').at(21).find('Button').at(0);
        expect(backBtn.text()).toBe('Back');
        backBtn.simulate('click');

        const submitButtom = wrapper.find('Button').at(1);
        expect(submitButtom.text()).toBe('Save');
        submitButtom.simulate('click');
        submitButtom.simulate('submit');
        wrapper.update();
      });
      setTimeout(() => {
        expect(props.onCreate).toHaveBeenCalledTimes(1);
        expect(props.onCreate).toHaveBeenCalledWith({
          title: 'FactCheck-1',
          excerpt: 'excerpt of factcheck',
          slug: 'factcheck-1',
          featured_medium_id: 1,
          status: 'draft',
          format_id: 1,
          author_ids: [1],
          authors: [1],
          categories: [1],
          category_ids: [1],
          published_date: null,
          tag_ids: [1],
          tags: [1],
          claims: [1, undefined],
          claim_ids: [1],
          claim_order: [1],
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
          header_code: `""use strict";↵↵class Chuck {↵    greet() {↵        return 'Hello';↵    }↵}"`,
          footer_code: '{↵    "info":"data",↵}',
        });
        done();
      }, 0);
    });
  });
});
