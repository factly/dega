import React from 'react';
import OrganisationPermissions from './organisations';
import SpacePermissions from './spaces';
import { Helmet } from 'react-helmet';

const Permissions = () => {
  return (
    <>
      <div>
        <>
          <Helmet title={'Permissions'} />
          <h3>Organisation Permissions</h3>
          <OrganisationPermissions />
        </>
      </div>

      <div>
        <h3>Space Permissions</h3>
        <SpacePermissions />
      </div>
    </>
  );
};

export default Permissions;
