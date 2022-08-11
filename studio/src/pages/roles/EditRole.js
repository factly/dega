import React from 'react';
import { getRole, updateRole } from '../../actions/roles';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import RoleEditForm from './components/RoleForm';

function EditRole() {
  const history = useHistory();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { role, loading } = useSelector((state) => {
    // if (!state.policies.details[id])
    //   return {
    //     policy: null,
    //     loading: state.policies.loading,
    //   };

    return {
      policy: {
        ...state.roles.details[id],
        // permissions: state.policies.details[id].permissions.reduce(
        //   (obj, item) => Object.assign(obj, { [item.resource]: item.actions }),
        //   {},
        // ),
        // users: state.policies.details[id].users
        //   ? state.policies.details[id].users.map((item) => parseInt(item.id))
        //   : [],
      },
      loading: state.policies.loading,
    };
  });
  React.useEffect(() => {
    dispatch(getRole(id));
  }, [dispatch, id]);
  const onCreate = (values) => {
    console.log('this has beeen called');
    // values.users = values.users.map((item) => item.toString());
    // values.permissions = values.permissions.filter(
    //   (item) => item && item.resource && item.actions.length > 0,
    // );
    dispatch(updateRole({ ...role, ...values })).then(() => history.push('/members/roles'));
  };

  return (
    <>
      <Helmet title={'Create Role'} />
      <RoleEditForm onCreate={onCreate} data={role} />
    </>
  );
}

export default EditRole;
