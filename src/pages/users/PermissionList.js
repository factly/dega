import React from 'react';
import { Space, Typography, Skeleton, Checkbox } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getPermissions } from '../../actions/permission';

const options = [
  { label: 'Get', value: 'get' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
];

function PermissionList() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const { details, loading } = useSelector((state) => {
    const node = state.permissions.req.find((each) => {
      return each === parseInt(id);
    });

    if (node)
      return {
        details: state.permissions.details[node],
        loading: state.permissions.loading,
      };
    return { details: [], loading: state.permissions.loading };
  });

  React.useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = () => {
    dispatch(getPermissions({ user_id: id }));
  };

  if (details.length === 0) {
    return null;
  }

  const permission = details;

  return (
    <Space direction={'vertical'}>
      {permission.map((each) => {
        return (
          <div key={each.resource}>
            <Typography>
              {each.resource.charAt(0).toUpperCase() + each.resource.slice(1)}{' '}
            </Typography>
            <br />
            <Checkbox.Group value={each.actions} options={options} key={each.resource} />
            <br />
            <br />
          </div>
        );
      })}
    </Space>
  );
}

export default PermissionList;
