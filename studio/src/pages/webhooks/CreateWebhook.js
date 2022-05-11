import React from 'react';
import WebhookCreateForm from './components/WebhookForm';
import { useDispatch } from 'react-redux';
import { addWebhook } from '../../actions/webhooks';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function CreateWebhook() {
  const history = useHistory();
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addWebhook(values)).then(() => history.push('/advanced/webhooks'));
  };
  return (
    <>
      <Helmet title={'Create Webhook'} />
      <WebhookCreateForm onCreate={onCreate} />
    </>
  );
}
export default CreateWebhook;
