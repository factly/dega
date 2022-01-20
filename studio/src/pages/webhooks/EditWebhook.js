import React from 'react';
import WebhookEditForm from './components/WebhookForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateWebhook, getWebhook } from '../../actions/webhooks';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';

function EditWebhook() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();
  const { webhook, loading } = useSelector((state) => {
    return {
      webhook: state.webhooks.details[id] ? state.webhooks.details[id] : null,
      loading: state.webhooks.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getWebhook(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  if (!webhook) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateWebhook({ ...webhook, ...values }));
    history.push(`/advanced/webhooks/${id}/edit`);
  };
  return (
    <>
      <Helmet title={'Edit Webhook'} />
      <WebhookEditForm data={webhook} onCreate={onUpdate} />
    </>
  );
}

export default EditWebhook;
