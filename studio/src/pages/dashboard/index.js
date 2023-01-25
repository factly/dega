import React, { useEffect } from 'react';
import { Col, Row, Space, Statistic, Typography, Card } from 'antd';

import Features from './components/Features';
import getUserPermission from '../../utils/getUserPermission';
import { useDispatch, useSelector } from 'react-redux';
import { getInfo } from '../../actions/info';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function Dashboard() {
  const { Title } = Typography;
  const { spaces, info } = useSelector(({ spaces, info }) => ({
    spaces,
    info,
  }));
  const actions = getUserPermission({ resource: 'dashboard', action: 'get', spaces });
  const dispatch = useDispatch();

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = () => {
    dispatch(getInfo());
  };

  const { article, factCheck } = info;

  return (
    <Space direction="vertical">
      <Helmet title={'Dashboard'} />
      <Typography.Title level={2}>new</Typography.Title>
      <Row justify="start" gutter={[16, 16]}>
        <Col>
          <Card size="small" className="stats-wrapper" style={{ background: '#f0f2f5' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={3} style={{ marginBottom: 0 }}>
                  Posts
                </Title>
              </Col>
              <Col span={24}>
                <Row gutter={[16, 16]} justify="space-around">
                  <Col md={{ span: 5 }}>
                    <Card size="small" hoverable={true} title="Total">
                      <Link to="/posts">
                        <Statistic value={article.publish + article.draft + article.ready} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 6 }}>
                    <Card size="small" hoverable={true} title="Published">
                      <Link to="/posts?status=publish">
                        <Statistic value={info.article.publish} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 5 }}>
                    <Card size="small" hoverable={true} title="Draft">
                      <Link to="/posts?status=draft">
                        <Statistic value={info.article.draft} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 8 }}>
                    <Card size="small" hoverable={true} title="Ready to publish">
                      <Link to="/posts?status=ready">
                        <Statistic value={info.article.ready} />
                      </Link>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <Card size="small" className="stats-wrapper" style={{ background: '#f0f2f5' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={3} style={{ marginBottom: 0 }}>
                  Fact Checks
                </Title>
              </Col>
              <Col span={24}>
                <Row gutter={[16, 16]} justify="space-around">
                  <Col md={{ span: 5 }}>
                    <Card size="small" hoverable={true} title="Total">
                      <Link to="/fact-checks">
                        <Statistic value={factCheck.publish + factCheck.draft + factCheck.ready} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 6 }}>
                    <Card size="small" hoverable={true} title="Published">
                      <Link to="/fact-checks?status=publish">
                        <Statistic value={info.factCheck.publish} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 5 }}>
                    <Card size="small" hoverable={true} title="Draft">
                      <Link to="/fact-checks?status=draft">
                        <Statistic value={info.factCheck.draft} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 8 }}>
                    <Card size="small" hoverable={true} title="Ready to publish">
                      <Link to="/fact-checks?status=ready">
                        <Statistic value={info.factCheck.ready} />
                      </Link>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {actions.includes('admin') ? <Features /> : null}
    </Space>
  );
}

export default Dashboard;
