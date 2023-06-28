import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/sachFactChecks';
import * as types from '../../constants/sachFactChecks';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  details: [],
  loading: true,
};

const factcheck = {
  claims: [
    {
      claimant: 'Daily Express',
      claimdate: '2017-02-16T00:00:00Z',
      claimreview: [
        {
          languagecode: 'en',
          reviewdate: '2017-02-16T00:00:00Z',
          textualrating:
            'The estimates suggest this happened, but it’s uncertain. The changes in the ONS’ best estimates weren’t big enough for us to be sure there was any real change.',
          title:
            'Reports on employment figures are accurate, but not the whole picture - Full Fact',
          url:
            'https://fullfact.org/immigration/reports-employment-figures-are-accurate-not-whole-picture/',
        },
      ],
      id: '62a03199a5f38940ad71ba7d',
      text: 'The number of British-born workers has fallen.',
    },
    {
      claimant: 'Daily Express',
      claimdate: '2017-02-15T00:00:00Z',
      claimreview: [
        {
          languagecode: 'en',
          reviewdate: '2017-02-16T00:00:00Z',
          textualrating:
            'That’s correct. The ONS’ best estimate for the number of non-UK born workers rose by 431,000 between the end of 2015 and the end of 2016.',
          title:
            'Reports on employment figures are accurate, but not the whole picture - Full Fact',
          url:
            'https://fullfact.org/immigration/reports-employment-figures-are-accurate-not-whole-picture/',
        },
      ],
      id: '62a0319aa5f38940ad71c04b',
      text: 'There are another 431,000 foreign born workers in the UK.',
    },
  ],
  date: '2017-02-16T00:00:00Z',
  humanlanguage: 'en',
  id: '62a0405ffa2840264aa24f27',
  pageurl:
    'https://fullfact.org/immigration/reports-employment-figures-are-accurate-not-whole-picture/',
  publisher: {
    name: 'Full Fact',
    site: 'fullfact.org',
  },
  sitename: 'Full Fact',
  tags: ['employment', 'United Kingdom'],
  text:
    "That’s correct. The ONS’ best estimate for the number of non-UK born workers rose by 431,000 between the end of 2015 and the end of 2016.\n“Another 431,000 migrants working in Britain”\nDaily Express, paper edition, 16 February 2017\n“British-born workers PLUNGE as foreign workers RISE by 431,000”\nDaily Express, online edition, 16 February 2017\nSeveral media outlets reported the most recent set of employment figures this morning, and the Daily Express featured the story on its front page. The figures reported are correct, but there’s a lot of uncertainty around some of the latest changes.\nThe good news is we haven’t seen anyone make the kind of mistakes we’ve seen in the past when it comes to reporting employment figures.\nAs the Office for National Statistics says prominently, these statistics don’t tell us how many people have lost jobs or how many people have got a new one, they just tell us the final change in the headcount of people who have jobs.\nThese estimates are very uncertain\nThe UK had 431,000 more foreign-born workers at the end of 2016 than it had a year beforehand, according to estimates from the Office for National Statistics (ONS).\nMeanwhile, its estimate for the number of workers born inside the UK dropped by 120,000.\nSo foreign-born workers rose in number while British born workers fell? Not quite.\nThe difference between these two changes is that the first is big enough for us to be confident it’s genuine, the second isn’t.\nThe estimates are based on a survey, so there’s a grey area around the ONS’ best estimate for the numbers of different groups of workers.\nThe estimate for UK-born workers and UK nationals in work would have to change by more than 200,000 for us to be reasonably confident that we were seeing a genuine change in the real world.\nThat may sound like a surprisingly big margin. But remember: there are an estimated 26 million UK-born workers or 28 million UK citizens in work. A change of less than 200,000 is difficult to detect with a lot of confidence, based on these figures.\nThere’s more than one definition of ‘foreigner’\nThe Office for National Statistics puts out employment figures for two groups which you might associate with the word, ‘foreigner’:\nPeople born inside / outside the UK\nUK / non-UK nationals\nThe estimated number of British-born workers didn’t ‘plunge’ on both definitions.\nThe best estimate for the number of UK-born workers fell by 120,000, and rose by 70,000 for UK nationals. Like before, these changes are too small for us to be confident they’ve actually happened.",
  title: 'Reports on employment figures are accurate, but not the whole picture',
  translation: {},
};

describe('sach fact-checks action', () => {
  // testing the loadingSachFactChecks action
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_SACH_FACT_CHECKS_LOADING,
      payload: true,
    };
    expect(actions.loadingSachFactChecks()).toEqual(startLoadingAction);
  });

  // testing the stopLoading fact check action
  it('should create an action to stop loading', () => {
    const stopLoadingAction = {
      type: types.SET_SACH_FACT_CHECKS_LOADING,
      payload: false,
    };
    expect(actions.stopLoading()).toEqual(stopLoadingAction);
  });

  //testing it addFactChecks action
  it('should create an action to add fact checks', () => {
    const addFactChecksAction = {
      type: types.ADD_SACH_FACT_CHECKS,
      payload: [factcheck],
    };
    expect(actions.addFactChecks([factcheck])).toEqual(addFactChecksAction);
  });
});
