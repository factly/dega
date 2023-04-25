import React from 'react';
import { Card, Avatar, Row, Col } from 'antd';
import { InteractionTwoTone, FileTextTwoTone, ApiTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
const Advanced = (children) => {
  const { Meta } = Card;
  const gridStyle = {
    textAlign: 'left',
  };
  return (
    <div>
      <Helmet title={'Advanced'} />
      <Row gutter={[16, 24]}>
      {
          children.map((child) => {
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
            )
          })
        }
      </Row>
    </div>
  );
};

export default Advanced;
