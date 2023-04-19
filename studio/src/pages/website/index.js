import React from 'react';
import { Card, Avatar, Row, Col } from 'antd';
import {
  CompassTwoTone,
  FundTwoTone,
  TagsTwoTone,
  ApiTwoTone,
  DeploymentUnitOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Website = () => {
  const { Meta } = Card;

  return (
    <div>
      <Helmet title={'Website'} />
      <Row gutter={[16, 24]}>
        <Col span={12}>
          <Link to={`/settings/website/general`}>
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<DeploymentUnitOutlined />} //<SettingTwoTone twoToneColor="#ffb41f" />}
                    style={{ backgroundColor: '#E8EFF2', color: '#ffb41f' }}
                  />
                }
                title="General"
                description="Basic Site Details and Site Meta Data"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`/settings/website/branding`}>
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    gap={4}
                    icon={<TagsTwoTone twoToneColor="#51bbf6" />}
                    style={{ backgroundColor: '#E8EFF2' }}
                  />
                }
                title="Branding"
                description="Update site logos, icons and design tokens"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to="/settings/website/menus">
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    gap={4}
                    icon={<CompassTwoTone twoToneColor="#7b2feb" />}
                    style={{ backgroundColor: '#E8EFF2' }}
                  />
                }
                title="Navigation"
                description="Setup Menus"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`/settings/website/code-injection`}>
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    gap={4}
                    icon={<ApiTwoTone twoToneColor="#30cf43" />}
                    style={{ backgroundColor: '#E8EFF2' }}
                  />
                }
                title="Code Injection"
                description="Add code to your site"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`/settings/website/analytics`}>
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    gap={4}
                    icon={<FundTwoTone twoToneColor="#fb2d8d" />}
                    style={{ backgroundColor: '#E8EFF2' }}
                  />
                }
                title="Analytics"
                description="View Analytics for your site"
              />
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

export default Website;
