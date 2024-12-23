import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Space, Typography, Table, Form, Button, Row, Col, Input, notification } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Text } = Typography;

const searchMembers = async () => {
  const response = await fetch(
    `${window.REACT_APP_ZITADEL_AUTHORITY}/management/v1/orgs/me/members/_search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        query: {
          offset: 0,
          limit: 100,
          asc: true,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }

  return response.json();
};

const removeMember = async (userId) => {
  const response = await fetch(
    `${window.REACT_APP_ZITADEL_AUTHORITY}/management/v1/orgs/me/members/${userId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to remove member');
  }

  return response;
};

function Organisations() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const { profile } = useSelector(({ profile }) => ({
    profile: profile.details,
  }));

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await searchMembers();
      setMembers(response.result);
    } catch (error) {
      console.error('Error fetching members:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch members',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMember(userId);
      notification.success({
        message: 'Success',
        description: 'Member removed successfully',
      });
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to remove member',
      });
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'displayName',
      key: 'name',
      width: '30%',
      render: (text) => <Text strong>{text || '---'}</Text>,
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          record.displayName?.toLowerCase().includes(value.toLowerCase()) ||
          record.email?.toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '40%',
      render: (text) => <Text strong>{text || '---'}</Text>,
    },
    {
      title: 'Role',
      dataIndex: 'roles',
      key: 'role',
      width: '20%',
      render: (roles) => <Text strong>{roles?.join(', ') || '---'}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Button danger onClick={() => handleRemoveMember(record.userId)}>
          {record.userId === profile?.id ? 'Leave' : 'Remove'}
        </Button>
      ),
    },
  ];

  const filteredMembers = members.filter(
    (member) =>
      member.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>Members</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/settings/organisations/addusers')}
          >
            Add New User
          </Button>
        </Col>
      </Row>

      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Input
            placeholder="Search by name or email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Col>
      </Row>

      <div style={{ width: '100%', overflow: 'auto' }}>
        <Table
          columns={columns}
          dataSource={filteredMembers}
          loading={loading}
          rowKey="userId"
          scroll={{
            x: 1150,
          }}
          pagination={{
            total: filteredMembers.length,
            current: filters.page,
            pageSize: filters.limit,
            onChange: (page, pageSize) => setFilters({ ...filters, page, limit: pageSize }),
          }}
        />
      </div>
    </Space>
  );
}

export default Organisations;
