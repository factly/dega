import { entitySelector } from './index';

const state = {
  categories: {
    req: [
      {
        data: [1, 2, 3],
        query: {
          page: 1,
        },
        total: 3,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-07-17T10:14:44.251814Z',
        updated_at: '2020-07-17T10:14:44.251814Z',
        deleted_at: null,
        name: 'category-1',
        slug: 'category-1',
        description: '',
        parent_id: 0,
        medium_id: 0,
        space_id: 1,
      },
      '2': {
        id: 2,
        created_at: '2020-07-17T10:14:48.173442Z',
        updated_at: '2020-07-17T10:14:48.173442Z',
        deleted_at: null,
        name: 'category-2',
        slug: 'category-2',
        description: '',
        parent_id: 0,
        medium_id: 0,
        space_id: 2,
      },
      '3': {
        id: 3,
        created_at: '2020-07-17T13:14:56.161227Z',
        updated_at: '2020-07-17T13:14:56.161227Z',
        deleted_at: null,
        name: 'category-3',
        slug: 'category-3',
        description: '',
        parent_id: 0,
        medium_id: 0,
        space_id: 2,
      },
    },
    loading: false,
  },
};
describe('Entity Selector', () => {
  it('should map entities based on query', () => {
    const page = 1;
    const entity = 'categories';
    const expected = {
      categories: [
        {
          id: 1,
          created_at: '2020-07-17T10:14:44.251814Z',
          updated_at: '2020-07-17T10:14:44.251814Z',
          deleted_at: null,
          name: 'category-1',
          slug: 'category-1',
          description: '',
          parent_id: 0,
          medium_id: 0,
          space_id: 1,
        },
        {
          id: 2,
          created_at: '2020-07-17T10:14:48.173442Z',
          updated_at: '2020-07-17T10:14:48.173442Z',
          deleted_at: null,
          name: 'category-2',
          slug: 'category-2',
          description: '',
          parent_id: 0,
          medium_id: 0,
          space_id: 2,
        },
        {
          id: 3,
          created_at: '2020-07-17T13:14:56.161227Z',
          updated_at: '2020-07-17T13:14:56.161227Z',
          deleted_at: null,
          name: 'category-3',
          slug: 'category-3',
          description: '',
          parent_id: 0,
          medium_id: 0,
          space_id: 2,
        },
      ],
      total: 3,
      loading: false,
    };
    expect(entitySelector(state, page, entity)).toEqual(expected);
  });
  it('should return empty empty list when query doesnt exist', () => {
    const page = 2;
    const entity = 'categories';
    const expected = {
      categories: [],
      total: 0,
      loading: false,
    };
    expect(entitySelector(state, page, entity)).toEqual(expected);
  });
});
