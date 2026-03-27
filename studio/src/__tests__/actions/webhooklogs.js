import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/webhooklogs';
import * as types from '../../constants/webhooklogs';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_EVENTS } from '../../constants/events';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
	req: [],
	details: {},
	loading: true,
};


describe('webhooklogs actions', () => {
	// loading set to true
	it('should create an action to set loading to true', () => {
		const expectedAction = {
			type: types.SET_WEBHOOKLOGS_LOADING,
			payload: true,
		};

		expect(actions.loadingWebhookLogs()).toEqual(expectedAction);
	});
	// set to false
	it('should create an action to set loading to false', () => {
		const expectedAction = {
			type: types.SET_WEBHOOKLOGS_LOADING,
			payload: false,
		};

		expect(actions.stopWebhookLogsLoading()).toEqual(expectedAction);
	});
	// addWebhooklogList
	it('should create an action to add webhooklog list', () => {
		const data = [{ id: 1, name: 'test' }];
		const expectedAction = {
			type: types.ADD_WEBHOOKLOGS,
			payload: data,
		};

		expect(actions.addWebhooklogList(data)).toEqual(expectedAction);
	});

	// addWebhookRequest
	it('should create an action to add webhook request', () => {
		const data = {
			data: [1, 2, 3],
			query: { page: 1, limit: 10 },
			total: 3,
		};

		const expectedAction = {
			type: types.ADD_WEBHOOKLOGS_REQUEST,
			payload: data,
		};

		expect(actions.addWebhookRequest(data)).toEqual(expectedAction);
	});

	// resetWebhooks
	it('should create an action to reset webhooks', () => {
		const expectedAction = {
			type: types.RESET_WEBHOOKLOGS,
		};

		expect(actions.resetWebhooks()).toEqual(expectedAction);

	});

	// fetch with success
	it('should create an action to fetch webhooklogs with success', () => {
		const webhooks = [{ id: 1, name: 'test' }]

		const query = { page: 1, limit: 10 };
		const resp = { data: { nodes: webhooks, total: 1 } };
		axios.get.mockResolvedValue(resp);

		const expectedActions = [
			{ type: types.SET_WEBHOOKLOGS_LOADING, payload: true },
			{ type: types.ADD_WEBHOOKLOGS, payload: webhooks },
			{
				type: types.ADD_WEBHOOKLOGS_REQUEST,
				payload: {
					data: [1],
					query: query,
					total: 1,
				},

			},
			{ type: types.SET_WEBHOOKLOGS_LOADING, payload: false },
		];

		const store = mockStore(initialState);

		return store.dispatch(actions.getWebhooklogs(1, query)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
	});

	// fetch with error
	it('should create an action to fetch webhooklogs with error', () => {
		const query = { page: 1, limit: 10 };
    const errorMessage = 'Unable to fetch';
		axios.get.mockRejectedValue(new Error(errorMessage));


		const expectedActions = [
			{ type: types.SET_WEBHOOKLOGS_LOADING, payload: true },
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
          title: 'Error',
          message: errorMessage,
          time: Date.now(),
				},
			},
			{ type: types.SET_WEBHOOKLOGS_LOADING, payload: false },
		];

		const store = mockStore(initialState);

		return store.dispatch(actions.getWebhooklogs(1, query)).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
	});
});
