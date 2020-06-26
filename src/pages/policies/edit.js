import React from 'react';
import PolicyCreateForm from './components/PolicyCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { getPolicy } from '../../actions/policies';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditPolicy() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { policy, loading } = useSelector((state) => {
    return {
      policy: state.policies.details[id] ? state.policies.details[id] : null,
      loading: state.policies.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getPolicy(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  const onUpdate = (values) => {
    console.log(values);
    //dispatch(updateCategory(values)).then(() => history.push('/categories'));
  };

  return <PolicyCreateForm data={policy} onCreate={onUpdate} />;
}

export default EditPolicy;
