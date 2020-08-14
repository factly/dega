import React from 'react';
import ClaimEditForm from './components/ClaimForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateClaim, getClaim } from '../../actions/claims';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditClaim() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { claim, loading } = useSelector((state) => {
    const claim = state.claims.details[id];

    return {
      claim,
      loading: state.claims.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getClaim(id));
  }, [id]);

  if (loading) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(updateClaim({ ...claim, ...values })).then(() => history.push('/claims'));
  };
  return <ClaimEditForm data={claim} onCreate={onUpdate} />;
}

export default EditClaim;
