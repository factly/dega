import React from 'react';
import SpaceRequestEditForm from './components/RequestForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateSpaceRequest, getSpaces } from '../../../actions/spaceRequests';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditSpaceRequest() {
  const history = useHistory();
  const { oid, pid } = useParams();

  const dispatch = useDispatch();

  const { organisation, loading } = useSelector((state) => {
    return {
      organisation: state.organisations.details[oid] ? state.organisations.details[oid] : null,
      loading: state.organisations.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch, oid, pid]);

  if (loading && !organisation) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(updateSpaceRequest({ ...organisation.permission, ...values })).then(() =>
      history.push('/requests/spaces'),
    );
  };

  return <SpaceRequestEditForm data={organisation.permission} onCreate={onUpdate} />;
}

export default EditSpaceRequest;
