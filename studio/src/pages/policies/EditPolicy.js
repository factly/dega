import React from 'react';
import PolicyEditForm from './components/PolicyForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { getPolicy, updatePolicy } from '../../actions/policies';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';

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

  if (loading) return <Skeleton />;

  if (!policy) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updatePolicy({ ...policy, ...values })).then(() =>
      history.push(`/members/policies/${id}/edit`),
    );
  };

  return (
    <>
      <Helmet title={`${policy?.name} - Edit Policy`} />
      <PolicyEditForm data={policy} onCreate={onUpdate} />
    </>
  );
}

export default EditPolicy;
