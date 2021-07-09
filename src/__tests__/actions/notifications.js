import * as actions from '../../actions/notifications';
import * as types from '../../constants/notifications';

Date.now = jest.fn(() => 1487076708000);

describe('notification actions', () => {
  it('should create an action to add error notification', () => {
    const errorMessage = 'Test Error Message';
    const errorNotificationAction = {
      type: types.ADD_NOTIFICATION,
      payload: {
        type: 'error',
        title: 'Error',
        message: errorMessage,
        time: Date.now(),
      },
    };
    expect(actions.addErrorNotification(errorMessage)).toEqual(errorNotificationAction);
  });
  it('should create an action to add success notification', () => {
    const successMessage = 'Test Success Message';
    const successNotification = {
      type: types.ADD_NOTIFICATION,
      payload: {
        type: 'success',
        title: 'Success',
        message: successMessage,
        time: Date.now(),
      },
    };
    expect(actions.addSuccessNotification(successMessage)).toEqual(successNotification);
  });
});
