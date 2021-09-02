import React from 'react';
import OrganisationPermissions from './organisations';
import SpacePermissions from './spaces';

const Permissions = () => {
  return (
    <>
      <div>
        <h3>Organisation Permissions</h3>
        <OrganisationPermissions />
      </div>

      <div>
        <h3>Space Permissions</h3>
        <SpacePermissions />
      </div>
    </>
  );
};

export default Permissions;
