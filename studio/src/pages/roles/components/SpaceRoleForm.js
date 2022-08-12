import React, { useEffect } from 'react';
import { Space, Form, Button, Select, Skeleton } from 'antd';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import { addSpaceRoleUserByID, getRoles, getSpaceUsers } from '../../../actions/roles';
import UserList from './SpaceRoleUserList';

function SpaceRoleForm() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { spaceID, roleId } = useParams();

  console.log(spaceID, 'spaceID');
  console.log(roleId, 'roleID');

  const { remainingSpaceUsers, roleUsersInSpace, loading, spacesLoading } = useSelector((state) => {
    const spaceUsers = Object.values(state.roles.spaceUsers);
    const roleUsersInSpace = state.roles.details[roleId]?.users ?? [];
    const remainingSpaceUsers = spaceUsers.filter((spaceUser) =>
      roleUsersInSpace.every((roleSpaceUser) => !(spaceUser.id === roleSpaceUser.id)),
    );
    console.log(remainingSpaceUsers, 'remainingSpaceUsers');
    return {
      remainingSpaceUsers: remainingSpaceUsers,
      roleUsersInSpace: roleUsersInSpace,
      loading: state.roles.loading,
      spacesLoading: state.roles.spacesLoading,
    };
  });

  // console.log(roles.details[roleId]?.users)
  //console.log(users);
  useEffect(() => {
    fetchSpaceRoles();
    fetchSpaceUsers();
  }, []);

  const fetchSpaceUsers = () => {
    dispatch(getSpaceUsers(spaceID));
  };

  const fetchSpaceRoles = () => {
    dispatch(getRoles());
  };

  // const fetchSpaceUsers = () => {
  //   dispatch(getSpaces())
  // }

  const onReset = () => {
    form.resetFields();
  };

  const onSubmit = (values) => {
    dispatch(addSpaceRoleUserByID({ user_id: values.user_id }, roleId)).then(() =>
      dispatch(getRoles()),
    );
    onReset();
  };

  //   React.useEffect(() => {
  //     fetchSpaceUsers();
  //     fetchSpaceRoleUsers();
  //     // eslint-disable-next-line
  //   }, []);

  return loading ? (
    <Loader />
  ) : (
    <div>
      {loading && spacesLoading ? (
        <Skeleton />
      ) : (
        <Space direction="vertical">
          {/* {userRole === 'owner' ? ( */}
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
          {/* )  */}
          {/* : null} */}
          <UserList
            // appID={appID} spaceID={spaceID} roleID={roleID}
            users={roleUsersInSpace}
          />
        </Space>
      )}
    </div>
  );
}

export default SpaceRoleForm;
