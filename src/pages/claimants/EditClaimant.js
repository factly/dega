import React from 'react';
import ClaimantEditForm from './components/ClaimantForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateClaimant, getClaimant } from '../../actions/claimants';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';

function EditClaimant() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { claimant, loading } = useSelector((state) => {
    return {
      claimant: state.claimants.details[id] ? state.claimants.details[id] : null,
      loading: state.claimants.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getClaimant(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  if (!claimant) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateClaimant({ ...claimant, ...values })).then(() =>
      history.push(`/claimants/${id}/edit`),
    );
  };

  return <ClaimantEditForm data={claimant} onCreate={onUpdate} />;
}

export default EditClaimant;
