import React from 'react';
import { PageHeader, Row, Divider } from 'antd';
import SpaceCreateForm from './components/SpaceCreateForm';
function CreateSpace() {
  const onCreate = (values) => {
    console.log('Received values of form: ', values);
  };
  return (
    <PageHeader onBack={() => window.history.back()} title="Create Spaces" ghost={false}>
      <Row className="justify-content-center">
        <Divider />
        <SpaceCreateForm onCreate={onCreate} />
      </Row>
    </PageHeader>
  );
}

export default CreateSpace;
