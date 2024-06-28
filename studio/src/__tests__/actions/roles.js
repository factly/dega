import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/roles';
import * as types from '../../constants/roles';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_MEDIA } from '../../constants/media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
	req: [],
	details: {},
	loading: true,
	total: 0,
	spaces: {
		selected: "new-space"
	},
};

describe('roles actions', () => {
	it("should create an action to set roles loading to true", () => {
		const expectedAction = {
			type: types.SET_ROLES_LOADING,
			payload: true,
		};
		expect(actions.loadingRoles()).toEqual(expectedAction);
	});

	it("should create an action to set roles loading to false", () => {
		const expectedAction = {
			type: types.SET_ROLES_LOADING,
			payload: false,
		};
		expect(actions.stopRolesLoading()).toEqual(expectedAction);
	});

	it("should create an action to add roles", () => {
		const roles = [
			{
				id: 1,
				name: "Test Role",
			},
			{
				id: 2,
				name: "Test Role 2",
			}
		];
		const expectedAction = {
			type: types.ADD_ROLES,
			payload: roles,
		};
		expect(actions.addRoles(roles)).toEqual(expectedAction);
	});

	it("should create an action to add role request", () => {
		const data = [1, 2];
		const query = {
			page: 1,
			limit: 10,
			sort: "name",
			order: "asc",
		};
		const total = 2;
		const expectedAction = {
			type: types.ADD_ROLES_REQUEST,
			payload: {
				data,
				query,
				total,
			},
		};
		expect(actions.addRolesRequest({ data, query, total })).toEqual(expectedAction);
	});
	it('should create an action to reset ratings', () => {
		const resetRatingsAction = {
			type: types.RESET_ROLES,
		};
		expect(actions.resetRoles()).toEqual(resetRatingsAction);
	});

	it('should create actions to fetch roles', () => {
		const query = { page: 1, limit: 5 };
		const roles = [{ id: 1, name: "Test Role" }];
		const resp = { data: roles };
		axios.get.mockResolvedValue(resp);

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: types.ADD_ROLES,
				payload: [{ id: 1, name: 'Test Role' }],
			},
			{
				type: types.ADD_ROLES_REQUEST,
				payload: {
					data: [1],
					query: query,
					total: 1,
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.getRoles(query))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.get).toHaveBeenCalledWith(types.ROLES_API(space));
	});

	it('should create actions to fetch roles with error', () => {
		const query = { page: 1, limit: 5 };
		const errorMessage = 'Unable to fetch';
		axios.get.mockRejectedValue(new Error(errorMessage));

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					title: 'Error',
					message: errorMessage,
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.getRoles(query))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.get).toHaveBeenCalledWith(types.ROLES_API(space));
	});

	it('should create actions to fetch role by id failure', () => {
		const id = 1;
		const errorMessage = 'Unable to fetch';
		axios.get.mockRejectedValue(new Error(errorMessage));

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					title: 'Error',
					message: errorMessage,
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.getRole(id))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.get).toHaveBeenCalledWith(types.ROLES_API(space) + '/' + id);
	});

	it('should create actions to fetch role by id', () => {
		const id = 1;
		const role = { id: 1, name: 'Test Role' };
		const resp = { data: role };
		axios.get.mockResolvedValue(resp);

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: types.GET_ROLE,
				payload: role,
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.getRole(id))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.get).toHaveBeenCalledWith(types.ROLES_API(space) + '/' + id);
	});

	it('should create actions to create role', () => {
		const role = { name: 'Test Role' };
		const resp = { data: role };
		axios.post.mockResolvedValue(resp);

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: types.RESET_ROLES,
			},
			{
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Role created',
          time: Date.now(),
        },
      },
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.createRole(role))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.post).toHaveBeenCalledWith(types.ROLES_API(space), role);
	});

	it('should create actions to create role with error', () => {
		const role = { name: 'Test Role' };
		const errorMessage = 'Unable to create';
		axios.post.mockRejectedValue(new Error(errorMessage));

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					title: 'Error',
					message: errorMessage,
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.createRole(role))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.post).toHaveBeenCalledWith(types.ROLES_API(space), role);
	});

	it('should create actions to update role', () => {
		const role = { id: 1, name: 'Test Role' };
		const resp = { data: role };
		axios.put.mockResolvedValue(resp);

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: types.UPDATE_ROLE,
				payload: role,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'success',
					title: 'Success',
					message: 'Roles updated',
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			}
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.updateRole(role))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.put).toHaveBeenCalledWith(types.ROLES_API(space) + '/' + role.id, role);
	});

	it('should create actions to update role with error', () => {
		const role = { id: 1, name: 'Test Role' };
		const errorMessage = 'Unable to update';
		axios.put.mockRejectedValue(new Error(errorMessage));

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					title: 'Error',
					message: errorMessage,
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			}
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.updateRole(role))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.put).toHaveBeenCalledWith(types.ROLES_API(space) + '/' + role.id, role);
	});

	it('should create actions to delete role', () => {
		const id = 1;
		const resp = { data: id };
		axios.delete.mockResolvedValue(resp);

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: types.RESET_ROLES,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'success',
					title: 'Success',
					message: 'Roles deleted',
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			}
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.deleteRole(id))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.delete).toHaveBeenCalledWith(types.ROLES_API(space) + '/' + id);
	});

	it('should create actions to delete role with error', () => {
		const id = 1;
		const errorMessage = 'Unable to delete';
		axios.delete.mockRejectedValue(new Error(errorMessage));

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: 'error',
					title: 'Error',
					message: errorMessage,
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			}
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.deleteRole(id))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.delete).toHaveBeenCalledWith(types.ROLES_API(space) + '/' + id);
	});

	it("should add user to the role successfully", () => {
		const role = { id: 1, name: "Test Role" };
		const user = { id: 1, name: "Test User" };
		const resp = { data: role };
		axios.post.mockResolvedValue(resp);

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: "success",
					title: "Success",
					message: "User Added Succesfully",
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.addRoleUser(role.id, user))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.post).toHaveBeenCalledWith(types.ROLES_API(space) + "/" + role.id + "/users", user);
	});

	it("should add user to the role with error", () => {
		const role = { id: 1, name: "Test Role" };
		const user = { id: 1, name: "Test User" };
		const errorMessage = "Unable to add user";
		axios.post.mockRejectedValue(new Error(errorMessage));

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: "error",
					title: "Error",
					message: errorMessage,
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.addRoleUser(role.id, user))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.post).toHaveBeenCalledWith(types.ROLES_API(space) + "/" + role.id + "/users", user);
	});

	it("should remove user from the role successfully", () => {
		const role = { id: 1, name: "Test Role", users: [{ id: 1, name: "Test User" }] };

		const resp = { data: role };
		axios.delete.mockResolvedValue(resp);

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: "success",
					title: "Success",
					message: "User Deleted Succesfully",
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.deleteRoleUser(role.id, role.users[0].id))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.delete).toHaveBeenCalledWith(types.ROLES_API(space) + "/" + role.id + "/users/" + role.users[0].id);
	});

	it("should remove user from the role with error", () => {
		const role = { id: 1, name: "Test Role", users: [{ id: 1, name: "Test User" }] };
		const errorMessage = "Unable to remove user";
		axios.delete.mockRejectedValue(new Error(errorMessage));

		const expectedActions = [
			{
				type: types.SET_ROLES_LOADING,
				payload: true,
			},
			{
				type: ADD_NOTIFICATION,
				payload: {
					type: "error",
					title: "Error",
					message: errorMessage,
					time: Date.now(),
				},
			},
			{
				type: types.SET_ROLES_LOADING,
				payload: false,
			},
		];

		const store = mockStore(initialState);
		store
			.dispatch(actions.deleteRoleUser(role.id, role.users[0].id))
			.then(() => expect(store.getActions()).toEqual(expectedActions));
		const space = store.getState().spaces.selected;
		expect(axios.delete).toHaveBeenCalledWith(types.ROLES_API(space) + "/" + role.id + "/users/" + role.users[0].id);
	});
});

