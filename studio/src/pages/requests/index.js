import React from 'react';
import SpaceRequests from './spaces/index';
import OrganisationRequests from './organisations/index';
import { Helmet } from 'react-helmet';

const Requests = () => {
  return (
    <>
      <div>
        <Helmet title={'Requests'} />
        <h3>Organisation Requests</h3>
        <OrganisationRequests />
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h3>Space Requests</h3>
        <SpaceRequests />
      </div>
    </>
  );
};

export default Requests;
