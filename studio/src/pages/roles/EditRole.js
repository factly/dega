import React from 'react';
import { getRole, updateRole } from '../../actions/roles';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import RoleEditForm from './components/RoleForm';
import { Skeleton } from 'antd';
import useNavigation from '../../utils/useNavigation';

function EditRole() {
  const history = useNavigation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { role, loading } = useSelector((state) => {
    return {
      role: state.roles.details[id],
      loading: state.roles.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getRole(id));
  }, [dispatch, id]);
  const onCreate = (values) => {
    dispatch(updateRole({ ...role, ...values })).then(() => history('/settings/members/roles'));
  };

  return (
    <>
      <Helmet title={'Update Role'} />
      {loading ? <Skeleton /> : <RoleEditForm onCreate={onCreate} data={role} />}
    </>
  );
}

export default EditRole;
