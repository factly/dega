import reducer from '../../reducers/googleFactChecksReducer';
import * as types from '../../constants/googleFactChecks';

const initialState = {
  req: [],
  loading: true,
};

const factCheck = {
  text: 'Video shows Russian doctors celebrating the new COVID-19 vaccine.',
  claimant: 'Facebook posts',
  claimDate: '2020-09-08T02:48:10Z',
  claimReview: [
    {
      publisher: {
        name: 'BOOM',
        site: 'boomlive.in',
      },
      url:
        'https://www.boomlive.in/world/video-from-saudi-arabia-shared-as-russian-doctors-celebrating-covid-19-vaccine-9654',
      title: 'Video From Saudi Arabia Shared As Russian Doctors Celebrating COVID-19 Vaccine',
      reviewDate: '2020-09-08T02:48:10Z',
      textualRating: 'False',
      languageCode: 'en',
    },
  ],
};

describe('google fact check reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [factCheck], query: { page: 1, limit: 1 }, total: 1 }],
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [factCheck], query: { page: 1, limit: 1 }, total: 1 }],
      loading: false,
    });
  });
  it('should handle SET_GOOGLE_FACT_CHECKS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_GOOGLE_FACT_CHECKS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_GOOGLE_FACT_CHECKS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      loading: false,
    });
  });
  it('should handle ADD_GOOGLE_FACT_CHECKS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_GOOGLE_FACT_CHECKS_REQUEST,
        payload: {
          data: [factCheck],
          query: { page: 1, limit: 1 },
          total: 1,
        },
      }),
    ).toEqual({
      req: [
        {
          data: [factCheck],
          query: { page: 1, limit: 1 },
          total: 1,
        },
      ],
      loading: true,
    });
  });
});
