import { Button, Typography, Card, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDefaultFormats, getFormats } from '../../../actions/formats';
import { addDefaultPolicies, getPolicies } from '../../../actions/policies';
import { addDefaultRatings, getRatings } from '../../../actions/ratings';
import { addDefaultEvents, getEvents} from '../../../actions/events';
import { useHistory } from 'react-router-dom';

function Features() {
  const dispatch = useDispatch();
  const history = useHistory();

  React.useEffect(() => {
    const fetchEntities = () => {
      dispatch(getRatings());
      dispatch(getFormats());
      dispatch(getPolicies());
      dispatch(getEvents());
    };
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { ratings, formats, policies, events } = useSelector(({ ratings, formats, policies, events }) => {
    return {
      ratings: Object.keys(ratings.details).length,
      formats: Object.keys(formats.details).length,
      policies: Object.keys(policies.details).length,
      events: Object.keys(events.details).length,
    };
  });

  return (
    <>
      {ratings > 0 && formats > 0 && policies > 0 ? null : (
        <Typography.Title level={3}>Add default features</Typography.Title>
      )}

      <Space>
        {ratings > 0 ? null : (
          <Card
            title="Ratings"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultRatings()).then(() => history.push('/ratings'));
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
        {formats > 0 ? null : (
          <Card
            title="Formats"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultFormats()).then(() => history.push('/formats'));
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

        {policies > 0 ? null : (
          <Card
            title="Policies"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultPolicies()).then(() => history.push('/policies'));
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
        {events > 0 ? null : (
          <Card
            title="Events"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultEvents()).then(() => history.push('/events'));
                }}
              >
                <PlusOutlined /> CREATE EVENTS
              </Button>,
            ]}
            style={{ width: 300 }}
          >
            Events for Create, Update and Delete for all entities will be created. Click below
            Button to create
          </Card>
        )}
      </Space>
    </>
  );
}

export default Features;
