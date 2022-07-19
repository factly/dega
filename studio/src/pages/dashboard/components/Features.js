import { Button, Typography, Card, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDefaultFormats, getFormats } from '../../../actions/formats';
import { addDefaultPolicies, getPolicies } from '../../../actions/policies';
import { addDefaultRatings, getRatings } from '../../../actions/ratings';
import { addDefaultEvents, getEvents } from '../../../actions/events';
import { useHistory } from 'react-router-dom';

function Features() {
  const dispatch = useDispatch();
  const history = useHistory();

  const superOrg = useSelector(({ admin }) => {
    return admin.organisation;
  });
  const isFactCheckEnabled = useSelector(({ admin, spaces }) => {
    return admin.organisation.space_permissions?.filter(
      (space) => space.id === spaces.selected,
    )?.[0]?.fact_check;
  });
  const createFormatDescription = isFactCheckEnabled
    ? 'Two formats will be created Fact Check and Article. Click below Button to create'
    : 'Format Article will be created. Click below Button to create ';
  const createFormatButtonText = isFactCheckEnabled ? 'CREATE FORMATS' : 'CREATE FORMAT';
  React.useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFactCheckEnabled]);

  const fetchEntities = () => {
    dispatch(getFormats());
    dispatch(getPolicies());
  };
  const fetchRatings = () => {
    if (isFactCheckEnabled) dispatch(getRatings());
  };

  React.useEffect(() => {
    if (superOrg.is_admin) {
      fetchEvents();
    }
  }, [superOrg.is_admin]);

  const fetchEvents = () => {
    dispatch(getEvents());
  };

  const {
    ratings,
    ratingsLoading,
    formats,
    formatsLoading,
    policies,
    policiesLoading,
    events,
    eventsLoading,
  } = useSelector(({ ratings, formats, policies, events }) => {
    return {
      ratings: Object.keys(ratings.details).length,
      ratingsLoading: ratings.loading,
      formats: Object.keys(formats.details).length,
      formatsLoading: formats.loading,
      policies: Object.keys(policies.details).length,
      policiesLoading: policies.loading,
      events: Object.keys(events.details).length,
      eventsLoading: events.loading,
    };
  });

  return (
    <>
      {!ratingsLoading &&
      !policiesLoading &&
      !formatsLoading &&
      (ratings < 1 || formats < 1 || policies < 1) ? (
        <Typography.Title level={3}>Add default features</Typography.Title>
      ) : null}

      <Space>
        {ratingsLoading ? null : ratings > 0 ? null : (
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
        {formatsLoading ? null : formats > 0 ? null : (
          <Card
            title="Formats"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultFormats()).then(() => history.push('/advanced/formats'));
                }}
              >
                <PlusOutlined /> {createFormatButtonText}
              </Button>,
            ]}
            style={{ width: 300 }}
          >
            {createFormatDescription}
          </Card>
        )}
        {policiesLoading ? null : policies > 0 ? null : (
          <Card
            title="Policies"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultPolicies()).then(() => history.push('/members/policies'));
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
        {eventsLoading ? null : superOrg.is_admin ? (
          events > 0 ? null : (
            <Card
              title="Events"
              actions={[
                <Button
                  onClick={() => {
                    dispatch(addDefaultEvents()).then(() => history.push('/admin/events'));
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
          )
        ) : null}
      </Space>
    </>
  );
}

export default Features;
