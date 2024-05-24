import React from 'react';
import WebhookCreateForm from './components/WebhookForm';
import { useDispatch } from 'react-redux';
import { addWebhook } from '../../actions/webhooks';

import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreateWebhook() {
  const history = useNavigation();
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addWebhook(values)).then(() => history('/settings/advanced/webhooks'));
  };
  return (
    <>
      <Helmet title={'Create Webhook'} />
      <WebhookCreateForm onCreate={onCreate} />
    </>
  );
}
export default CreateWebhook;
