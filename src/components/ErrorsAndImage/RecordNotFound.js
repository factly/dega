import React from 'react';
import { Result,Button } from 'antd';
import { Link } from 'react-router-dom';

function RecordNotFound({status, title, link}) {
  return (
    <Result 
        status={status ? status: "404"}
        title={title ? title : "Sorry, could not find what you are looking for."}
        extra={
          link ? <Link to="/formats">
            <Button>
              Create Format
            </Button>
          </Link> : null
        }
      />
  );
};

export default RecordNotFound;