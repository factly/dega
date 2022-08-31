import React from 'react';
import { getRole, updateRole } from '../../actions/roles';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import RoleEditForm from './components/RoleForm';
import { Skeleton } from 'antd';

function EditRole() {
  const history = useHistory();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { role, loading } = useSelector((state) => {
    return {
      role: state.roles.details[id],
      loading: state.roles.loading,
    };
  });

  console.log(role, loading);
  React.useEffect(() => {
    dispatch(getRole(id));
  }, [dispatch, id]);
  const onCreate = (values) => {
    console.log('this has beeen called');
    console.log({ values });
    dispatch(updateRole({ ...role, ...values })).then(() => history.push('/members/roles'));
  };

  return (
    <>
      <Helmet title={'Update Role'} />
      {loading ? <Skeleton /> : <RoleEditForm onCreate={onCreate} data={role} />}
    </>
  );
}

export default EditRole;
