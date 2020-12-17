import React from 'react';
import ClaimEditForm from './components/ClaimForm';
import { useDispatch, useSelector } from 'react-redux';
import { Result } from 'antd';
import { updateClaim, getClaim } from '../../actions/claims';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

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

  if (loading && !claim) {
    return ( 
      <Result 
        status="404"
        title="404"
        subTitle="Sorry, could not find what you are looking for."
      />
    );
  };

  const onUpdate = (values) => {
    dispatch(updateClaim({ ...claim, ...values })).then(() => history.push('/claims'));
  };
  return <ClaimEditForm data={claim} onCreate={onUpdate} />;
}

export default EditClaim;
