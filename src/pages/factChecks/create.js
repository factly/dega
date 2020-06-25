import React from 'react';
import FactCheckCreateForm from './components/FactCheckCreateForm';
import { useDispatch } from 'react-redux';
import { addFactCheck } from '../../actions/factChecks';
import { useHistory } from 'react-router-dom';

function CreateFactCheck() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addFactCheck(values)).then(() => history.push('/fact-checks'));
  };
  return <FactCheckCreateForm onCreate={onCreate} />;
}

export default CreateFactCheck;
