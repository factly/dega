import React from 'react';
import { Space, Typography, Table, Form, Button, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import { getSpaceUsers, updateSpaceUsers } from '../../actions/spaces';
import Selector from '../../components/Selector';
import { useNavigate } from 'react-router-dom';

function Users() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { spaceUsers, loading } = useSelector((state) => {
    const spaceUsers = state.spaces?.details?.[state.spaces?.selected]?.users?.length
      ? state.spaces?.details?.[state.spaces?.selected]?.users
      : [];
    return {
      spaceUsers: spaceUsers,
      loading: state.spaces?.loading,
    };
  });
  React.useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = () => {
    dispatch(getSpaceUsers());
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'display_name',
      key: 'name',
      width: '50%',
      render: (record) => (
        <Typography.Text style={{ fontSize: '1rem' }} strong>
          {record}
        </Typography.Text>
      ),
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      width: '50%',
      render: (record) => (
        <Typography.Text style={{ fontSize: '1rem' }} strong>
          {record}
        </Typography.Text>
      ),
    },
  ];

  return loading ? (
    <Loader />
  ) : (
    <Space direction={'vertical'}>
      <Helmet title={'Users'} />
      <Form
        layout={'vertical'}
        onFinish={(values) =>
          dispatch(updateSpaceUsers({ ids: values.users ? values.users : [] })).then(() =>
            navigate('/settings/users'),
          )
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Form.Item name="users" required={true}>
              <Selector mode="multiple" display={'display_name'} action="Users" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Button type="primary" htmlType="submit">
              Add users
            </Button>
          </Col>
        </Row>
      </Form>

      <Table
        columns={columns}
        dataSource={spaceUsers}
        loading={loading}
        rowKey={['record', 'user', 'id']}
      />
    </Space>
  );
}

export default Users;
