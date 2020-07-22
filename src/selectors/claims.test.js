import { claimSelector } from './claims';

const state = {
  claims: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
        },
        total: 2,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-07-16T13:39:03.832809Z',
        updated_at: '2020-07-16T13:39:03.832809Z',
        deleted_at: null,
        title: 'Claim-1',
        slug: 'claim-1',
        claimant_id: 1,
        rating_id: 1,
        space_id: 1,
      },
      '2': {
        id: 2,
        created_at: '2020-07-17T13:01:56.767057Z',
        updated_at: '2020-07-17T13:01:56.767057Z',
        deleted_at: null,
        title: 'Claim-2',
        slug: 'claim-2',
        claimant_id: 2,
        rating_id: 2,
        space_id: 1,
      },
    },
    loading: false,
  },
  claimants: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
        },
        total: 2,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-07-16T13:35:46.135593Z',
        updated_at: '2020-07-16T13:35:46.135593Z',
        deleted_at: null,
        name: 'Times of India',
        slug: 'times-of-india',
        description: '',
        tag_line: '',
        medium_id: 0,
        space_id: 1,
      },
      '2': {
        id: 2,
        created_at: '2020-07-20T06:07:22.852038Z',
        updated_at: '2020-07-20T06:07:22.852038Z',
        deleted_at: null,
        name: 'Whatsapp',
        slug: 'whatsapp',
        description: '',
        tag_line: '',
        medium_id: 0,
        space_id: 1,
      },
    },
    loading: false,
  },
  ratings: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
        },
        total: 2,
      },
    ],
    details: {
      '1': {
        id: 1,
        created_at: '2020-07-16T13:35:54.283014Z',
        updated_at: '2020-07-16T13:35:54.283014Z',
        deleted_at: null,
        name: 'False',
        slug: 'false',
        description: '',
        numeric_value: 1,
        medium_id: 0,
        space_id: 1,
      },
      '2': {
        id: 2,
        created_at: '2020-07-20T06:06:48.388471Z',
        updated_at: '2020-07-20T06:06:48.388471Z',
        deleted_at: null,
        name: 'True',
        slug: 'True',
        description: '',
        numeric_value: 5,
        medium_id: 0,
        space_id: 1,
      },
    },
    loading: false,
  },
};

describe('Claims Selector', () => {
  it('should map entities based on query', () => {
    const page = 1;
    const entity = 'categories';
    const expected = {
      claims: [
        {
          id: 1,
          created_at: '2020-07-16T13:39:03.832809Z',
          updated_at: '2020-07-16T13:39:03.832809Z',
          deleted_at: null,
          title: 'Claim-1',
          slug: 'claim-1',
          claimant_id: 1,
          claimant: 'Times of India',
          rating_id: 1,
          rating: 'False',
          space_id: 1,
        },
        {
          id: 2,
          created_at: '2020-07-17T13:01:56.767057Z',
          updated_at: '2020-07-17T13:01:56.767057Z',
          deleted_at: null,
          title: 'Claim-2',
          slug: 'claim-2',
          claimant_id: 2,
          claimant: 'Whatsapp',
          rating_id: 2,
          rating: 'True',
          space_id: 1,
        },
      ],
      total: 2,
      loading: false,
    };
    expect(claimSelector(state, page, entity)).toEqual(expected);
  });
  it('should return empty empty list when query doesnt exist', () => {
    const page = 2;
    const entity = 'categories';
    const expected = {
      claims: [],
      total: 0,
      loading: false,
    };
    expect(claimSelector(state, page, entity)).toEqual(expected);
  });
});
