import React from 'react';
import { PageHeader, Row, Divider } from 'antd';
import SpaceCreateForm from './components/SpaceCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { addSpaces } from '../../actions/spaces';

function CreateSpace() {
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpaces(values));
    console.log('Received values of form: ', values);
  };
  return (
    <PageHeader title="Create Spaces" ghost={false}>
      <Row className="justify-content-center">
        <Divider />
        <SpaceCreateForm onCreate={onCreate} />
      </Row>
    </PageHeader>
  );
}

export default CreateSpace;
