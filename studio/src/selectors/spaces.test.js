import { spaceSelector } from './spaces';
const state = {
  spaces: {
    orgs: [
      {
        id: 1,
        created_at: '2020-07-11T10:32:16.739676Z',
        updated_at: '2020-07-11T10:32:22.200875Z',
        deleted_at: null,
        title: 'Times of India',
        slug: '',
        permission: {
          id: 1,
          created_at: '2020-07-11T10:32:16.75739Z',
          updated_at: '2020-07-11T10:32:16.75739Z',
          deleted_at: null,
          role: 'owner',
        },
        spaces: [1],
      },
      {
        id: 2,
        created_at: '2020-07-11T10:32:16.739676Z',
        updated_at: '2020-07-11T10:32:22.200875Z',
        deleted_at: null,
        title: 'Eenadu',
        slug: '',
        permission: {
          id: 1,
          created_at: '2020-07-11T10:32:16.75739Z',
          updated_at: '2020-07-11T10:32:16.75739Z',
          deleted_at: null,
          role: 'owner',
        },
        spaces: [2],
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-07-16T13:30:32.897274Z',
        updated_at: '2020-07-16T13:30:32.897274Z',
        deleted_at: null,
        name: 'English',
        slug: 'english',
        organisation_id: 1,
      },
      '2': {
        id: 2,
        created_at: '2020-07-16T13:30:32.897274Z',
        updated_at: '2020-07-16T13:30:32.897274Z',
        deleted_at: null,
        name: 'Telugu',
        slug: 'telugu',
        organisation_id: 2,
      },
    },
    loading: false,
    selected: 1,
  },
};

describe('Spaces Selector', () => {
  it('should map spaces based on selected space', () => {
    const expected = {
      spaces: [
        {
          id: 1,
          created_at: '2020-07-16T13:30:32.897274Z',
          updated_at: '2020-07-16T13:30:32.897274Z',
          deleted_at: null,
          name: 'English',
          slug: 'english',
          organisation_id: 1,
        },
      ],
      loading: false,
    };
    expect(spaceSelector(state)).toEqual(expected);
  });
  it('should return empty spaces when organisation with selected space is unavailable', () => {
    const state = {
      spaces: {
        orgs: [
          {
            id: 1,
            created_at: '2020-07-11T10:32:16.739676Z',
            updated_at: '2020-07-11T10:32:22.200875Z',
            deleted_at: null,
            title: 'Times of India',
            slug: '',
            permission: {
              id: 200,
              created_at: '2020-07-11T10:32:16.75739Z',
              updated_at: '2020-07-11T10:32:16.75739Z',
              deleted_at: null,
              role: 'owner',
            },
            spaces: [100],
          },
        ],
        details: {
          '100': {
            id: 100,
            created_at: '2020-07-16T13:30:32.897274Z',
            updated_at: '2020-07-16T13:30:32.897274Z',
            deleted_at: null,
            name: 'English',
            slug: 'english',
            organisation_id: 1,
          },
        },
        loading: false,
        selected: 3,
      },
    };
    const expected = {
      spaces: [],
      loading: false,
    };
    expect(spaceSelector(state)).toEqual(expected);
  });
});
