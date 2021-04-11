import React from 'react';
import { Result, Skeleton, Space } from 'antd';
import { useSelector } from 'react-redux';

function Analytics() {
  const { space, loading } = useSelector(({ spaces }) => {
    return {
      space: spaces.details[spaces.selected],
      loading: spaces.loading,
    };
  });

  if (loading) return <Skeleton />;

  return (
    <Space direction="vertical">
      {space.analytics && space.analytics.plausible && space.analytics.plausible.embed_code ? (
        <div dangerouslySetInnerHTML={{ __html: space.analytics.plausible.embed_code }} />
      ) : (
        <Result title="No analytics found" />
      )}
    </Space>
  );
}

export default Analytics;
