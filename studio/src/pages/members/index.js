import React from 'react';
import { Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Members = (children) => {
  const { Meta } = Card;

  return (
    <div>
      <Row gutter={[16, 24]}>
        <Helmet title={'Members'} />
        {children.map((child) => {
          return (
            <Col md={12} xs={24}>
              <Link to={`/settings${child.url}`}>
                <Card hoverable>
                  <Meta
                    avatar={child.avatar()}
                    title={child.name}
                    description={child.description}
                  />
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default Members;
