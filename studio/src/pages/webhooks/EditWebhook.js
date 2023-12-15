import React from 'react';
import WebhookEditForm from './components/WebhookForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateWebhook, getWebhook } from '../../actions/webhooks';
 
import { useParams } from 'react-router-dom';
import { Skeleton, Row, Col } from 'antd';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';
import Webhooklogs from './webhooklogs';
import useNavigation from '../../utils/useNavigation';

function EditWebhook() {
  const history = useNavigation();
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
    history(`/settings/advanced/webhooks/${id}/edit`);
  };
  return (
    <>
      <Helmet title={'Edit Webhook'} />
      <Row>
        <Col span={16}>
          <WebhookEditForm data={webhook} onCreate={onUpdate} />
        </Col>
        <Col span={8}>
          <Webhooklogs WebhookId={webhook.id} />
        </Col>
      </Row>
    </>
  );
}

export default EditWebhook;
