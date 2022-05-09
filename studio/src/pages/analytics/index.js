import React from 'react';
import { Result, Skeleton, Space } from 'antd';
import { useSelector } from 'react-redux';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';
function Analytics() {
  const { space, loading } = useSelector(({ spaces }) => {
    return {
      space: spaces.details[spaces.selected],
      loading: spaces.loading,
    };
  });

  if (loading) return <Skeleton />;
  if (!space) return <RecordNotFound title={'No space found.'} link="/spaces" entity={'Space'} />;

  return (
    <Space direction="vertical">
      <Helmet title={'Analytics'} />
      {space.analytics && space.analytics.plausible && space.analytics.plausible.embed_code ? (
        <div dangerouslySetInnerHTML={{ __html: space.analytics.plausible.embed_code }} />
      ) : (
        <Result title="No analytics found" />
      )}
    </Space>
  );
}

export default Analytics;
