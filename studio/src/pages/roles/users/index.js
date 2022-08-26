
import React from 'react';
import { Space, Form, Button, Select, Skeleton } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UserList from './components/RoleUserList';
import { getSpaceUsers } from '../../../actions/spaces';
import { addRoleUser, deleteRoleUser, getRoles } from '../../../actions/roles';

export default function RoleUsers() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const {roleID} = useParams();
  const {remainingSpaceUsers, loading, roleUsers, loadingUserRole } = useSelector((state) =>  {
    const spaceUsers = state.spaces?.details?.[state.spaces?.selected]?.users?.length ? state.spaces?.details?.[state.spaces?.selected]?.users : []
    const roleUsers = state.roles.details?.[roleID]?.users
    var remainingSpaceUsers = []
    if (spaceUsers?.length) {
      remainingSpaceUsers = spaceUsers.filter((spaceUser) => roleUsers.every((roleUser) => !(spaceUser.id === roleUser.id)))
    }
    return {
      remainingSpaceUsers: remainingSpaceUsers,
      loading: state.spaces?.loading,
      roleUsers,
      loadingRoles: state.roles.loading
    }
  })

  React.useEffect(() => {
    dispatch(getSpaceUsers())
    dispatch(getRoles())
  }, [roleID])

  const onSubmit = (data) => {
    dispatch(addRoleUser(roleID, data)).then(() => dispatch(getRoles()))
    form.resetFields()
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/members/roles`}>
        <Button type="primary">Back to Roles</Button>
      </Link>
      {loading && loadingUserRole ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
            <Form
              form={form}
              name="add-space-role-user"
              layout="inline"
              onFinish={(values) => {
                onSubmit(values);
              }}
            >
              <Form.Item name="user_id" label="Users">
                <Select bordered listHeight={128} style={{ width: 200 }} placeholder="select user">
                  {remainingSpaceUsers.map((user, index) => (
                    <Select.Option value={user.id} key={index}>
                      {user.email}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" form="add-space-role-user">
                  Add Users
                </Button>
              </Form.Item>
            </Form>
          <UserList  roleID={roleID} users={roleUsers} />
        </Space>
      )}
    </div>
  )
}