import { Button, Typography, Card, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDefaultFormats, getFormats } from '../../../actions/formats';
import { addDefaultPolicies, getPolicies } from '../../../actions/policies';
import { addDefaultRatings, getRatings } from '../../../actions/ratings';

import useNavigation from '../../../utils/useNavigation';

function Features() {
  const dispatch = useDispatch();
  const history = useNavigation();

  const selectedSpace = useSelector((state) => ({ space_id: state.spaces.selected }));
  React.useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    ratings,
    ratingsLoading,
    formats,
    formatsLoading,
    policies,
    policiesLoading,
    loadingServices,
  } = useSelector(({ ratings, formats, policies, events, spaces }) => {
    return {
      ratings: Object.keys(ratings.details).length,
      ratingsLoading: ratings.loading,
      formats: Object.keys(formats.details).length,
      formatsLoading: formats.loading,
      policies: Object.keys(policies.details).length,
      policiesLoading: policies.loading,
      events: Object.keys(events.details).length,
      eventsLoading: events.loading,
      loadingServices: spaces.loading,
    };
  });

  React.useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchEntities = () => {
    if (!loadingServices) {
      dispatch(getRatings());

      dispatch(getFormats());
      dispatch(getPolicies());
    }
  };

  return (
    <>
      {!ratingsLoading &&
      !policiesLoading &&
      !formatsLoading &&
      (ratings < 1 || formats < 1 || policies < 1) ? (
        <Typography.Title level={3}>Add default features</Typography.Title>
      ) : null}

      <Space>
        {ratingsLoading && loadingServices
          ? null
          : ratings > 0 || (
              <Card
                title="Ratings"
                actions={[
                  <Button
                    onClick={() => {
                      dispatch(addDefaultRatings()).then(() => history('/ratings'));
                    }}
                  >
                    <PlusOutlined /> CREATE RATINGS
                  </Button>,
                ]}
                style={{ width: 300 }}
              >
                Five ratings will be created True, Partly True, Misleading, Partly False and False.
                Click below Button to create
              </Card>
            )}
        {formatsLoading ? null : formats > 0 ? null : (
          <Card
            title="Formats"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultFormats(selectedSpace)).then(() =>
                    history('/advanced/formats'),
                  );
                }}
              >
                <PlusOutlined /> CREATE FORMATS
              </Button>,
            ]}
            style={{ width: 300 }}
          >
            Two formats will be created Fact Check and Article. Click below Button to create
          </Card>
        )}
        {policiesLoading ? null : policies > 0 ? null : (
          <Card
            title="Policies"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultPolicies()).then(() => history('/members/policies'));
                }}
              >
                <PlusOutlined /> CREATE POLICIES
              </Button>,
            ]}
            style={{ width: 300 }}
          >
            Three policies will be created Editor, Author and Contributor. Click below Button to
            create
          </Card>
        )}
      </Space>
    </>
  );
}

export default Features;
