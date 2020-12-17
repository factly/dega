import React from 'react';
import PolicyEditForm from './components/PolicyForm';
import { useDispatch, useSelector } from 'react-redux';
import { Result } from 'antd';
import { getPolicy, updatePolicy } from '../../actions/policies';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditPolicy() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { policy, loading } = useSelector((state) => {
    if (!state.policies.details[id])
      return {
        policy: null,
        loading: state.policies.loading,
      };

    return {
      policy: {
        ...state.policies.details[id],
        permissions: state.policies.details[id].permissions.reduce(
          (obj, item) => Object.assign(obj, { [item.resource]: item.actions }),
          {},
        ),
        users: state.policies.details[id].users
          ? state.policies.details[id].users.map((item) => parseInt(item.id))
          : [],
      },
      loading: state.policies.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getPolicy(id));
  }, [dispatch, id]);

  if (loading && !policy) {
    return ( 
      <Result 
        status="404"
        title="404"
        subTitle="Sorry, could not find what you are looking for."
      />
    );
  };

  const onUpdate = (values) => {
    dispatch(updatePolicy({ ...policy, ...values })).then(() => history.push('/policies'));
  };

  return <PolicyEditForm data={policy} onCreate={onUpdate} />;
}

export default EditPolicy;
