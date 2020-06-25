import React from 'react';
import FactCheckCreateForm from './components/FactCheckCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateFactCheck, getFactCheck } from '../../actions/factChecks';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditFactCheck() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { factCheck, loading } = useSelector((state) => {
    const factCheck = state.factChecks.details[id];

    return {
      factCheck,
      loading: state.factChecks.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getFactCheck(id));
  }, [id]);

  if (loading) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(updateFactCheck({ ...factCheck, ...values })).then(() => history.push('/fact-checks'));
  };
  return <FactCheckCreateForm data={factCheck} onCreate={onUpdate} />;
}

export default EditFactCheck;
