import React from 'react';
import { Card, Avatar, Row, Col } from 'antd';
import { InteractionTwoTone, FileTextTwoTone, ApiTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
const Advanced = () => {
  const { Meta } = Card;
  const gridStyle = {
    textAlign: 'left',
  };
  return (
    <div>
      <Helmet title={'Advanced'} />
      <Row gutter={[16, 24]}>
        <Col xs={24} md={12}>
          <Link to="/settings/advanced/webhooks">
            <Card style={gridStyle} hoverable>
              <Meta
                avatar={
                  <Avatar
                    gap={4}
                    icon={<ApiTwoTone twoToneColor="#51bbf6" />}
                    style={{ backgroundColor: '#E8EFF2' }}
                  />
                }
                title="Webhooks"
                description="Create/ Modify Webhooks"
              />
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12}>
          <Link to="/settings/advanced/reindex">
            <Card style={gridStyle} hoverable>
              <Meta
                avatar={
                  <Avatar
                    gap={4}
                    icon={<InteractionTwoTone twoToneColor="#7b2feb" />}
                    style={{ backgroundColor: '#E8EFF2' }}
                  />
                }
                title="Re-Indexing Meili"
                description="Re-Index Meili Database"
              />
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12}>
          <Link to="/settings/advanced/formats">
            <Card style={gridStyle} hoverable>
              <Meta
                avatar={
                  <Avatar
                    gap={4}
                    icon={<FileTextTwoTone twoToneColor="#30cf43" />}
                    style={{ backgroundColor: '#E8EFF2' }}
                  />
                }
                title="Formats"
                description="Add/Edit formats"
              />
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

export default Advanced;
