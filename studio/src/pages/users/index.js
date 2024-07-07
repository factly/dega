import { useEffect, useState } from 'react';
import { Space, Typography, Table, Form, Button, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import { getSpaceUsers, updateSpaceUsers } from '../../actions/spaceUsers';
import Selector from '../../components/Selector';
import { useLocation, useNavigate } from 'react-router-dom';
import deepEqual from 'deep-equal';

function Users() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const pathname = useLocation().pathname;
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const { spaceUsers, total, loading } = useSelector(({ spaceUsers }) => {
    const node = spaceUsers.req.find((item) => {
      return deepEqual(item.query, { page: query.get('page'), limit: query.get('limit') });
    });

    if (node)
      return {
        spaceUsers: node.data.map((element) => spaceUsers.details[element]),
        total: node.total,
        loading: spaceUsers.loading,
      };
    return { spaceUsers: [], total: 0, loading: spaceUsers.loading };
  });

  useEffect(() => {
    navigate(pathname + '?' + new URLSearchParams(filters).toString());
  }, [filters, pathname, navigate]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = () => {
    dispatch(getSpaceUsers(filters));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
      render: (record) => (
        <Typography.Text style={{ fontSize: '1rem' }} strong>
          {record}
        </Typography.Text>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'display_name',
      key: 'name',
      width: '35%',
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
        pagination={{
          total: total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
      />
    </Space>
  );
}

export default Users;
