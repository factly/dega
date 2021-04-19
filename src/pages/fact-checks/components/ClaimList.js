import { Card, Typography } from 'antd';
import React from 'react';

function ClaimList({ ids, setClaimID, details, showModal }) {
  return (
    <div>
      <Typography.Title level={5}>Claims</Typography.Title>
      {ids.map((id) => (
        <Card
          title={
            <a
              style={{ textDecoration: 'none' }}
              onClick={() => {
                setClaimID(id);
                showModal();
              }}
            >
              {details[id].claim}
            </a>
          }
          style={{ margin: 5 }}
        >
          {details[id].fact}
        </Card>
      ))}
    </div>
  );
}

export default ClaimList;
