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
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Link to="/advanced/webhooks">
            <Card style={gridStyle} hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<ApiTwoTone twoToneColor="#51bbf6" />}
                    style={{ backgroundColor: 'transparent' }}
                  />
                }
                title="Webhooks"
                description="Create/ Modify Webhooks"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to="/advanced/reindex">
            <Card style={gridStyle} hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<InteractionTwoTone twoToneColor="#7b2feb" />}
                    style={{ backgroundColor: 'transparent' }}
                  />
                }
                title="Re-Indexing Meili"
                description="Re-Index Meili Database"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to="/advanced/formats">
            <Card style={gridStyle} hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<FileTextTwoTone twoToneColor="#30cf43" />}
                    style={{ backgroundColor: 'transparent' }}
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
