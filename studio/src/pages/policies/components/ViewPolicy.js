import React from 'react';
import { Descriptions, Tag, Table, Skeleton, Button, Divider } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ViewPolicy() {
  const { policyID } = useParams();
  const span = 2;
  const nestedTableColumns = [
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => {
        return record.actions?.map((action) => {
          return (
            <Tag key={action} color="blue">
              {action}
            </Tag>
          );
        });
      },
    },
  ];

  const { policy, loading } = useSelector((state) => {
    return {
      policy: state.policies.details?.[policyID],
      loading: state.policies.loading,
    };
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/settings/members/policies`}>
        <Button icon={<LeftOutlined />} type="secondary">
          {' '}
          Back to Policies
        </Button>
      </Link>
      <h2> Policy Details </h2>
      {loading ? (
        <Skeleton />
      ) : (
        <Descriptions bordered>
          <Descriptions.Item label="Name" span={span}>
            {policy?.name}
          </Descriptions.Item>
          <br />
          <Descriptions.Item label="Description" span={span}>
            {policy?.description}
          </Descriptions.Item>
          <br />
        </Descriptions>
      )}
      <Divider />
      <h3> Permissions </h3>
      <Table
        bordered={true}
        columns={nestedTableColumns}
        dataSource={policy?.permissions}
        rowKey={'id'}
        pagination={true}
      />
    </div>
  );
}
