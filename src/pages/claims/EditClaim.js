import React from 'react';
import ClaimEditForm from './components/ClaimForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateClaim, getClaim } from '../../actions/claims';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';

function EditClaim() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { claim, loading } = useSelector((state) => {
    return {
      claim: state.claims.details[id] ? state.claims.details[id] : null,
      loading: state.claims.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getClaim(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Skeleton />
  
  if (!loading && !claim) {
    return <RecordNotFound />
  }; 

  const onUpdate = (values) => {
    dispatch(updateClaim({ ...claim, ...values })).then(() => history.push('/claims'));
  };
  return <ClaimEditForm data={claim} onCreate={onUpdate} />;
}

export default EditClaim;
