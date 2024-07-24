import React, { useEffect } from 'react';
import { Col, Row, Space, Statistic, Typography, Card } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getInfo } from '../../actions/info';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Loader from '../../components/Loader';

const styles = {
  justifyContent: 'center',
};

function Dashboard() {
  const { Title } = Typography;
  const { spaces, info } = useSelector(({ spaces, info }) => ({
    spaces,
    info,
  }));
  const dispatch = useDispatch();

  useEffect(() => {
    if (spaces.selected !== '') fetchInfo();
  }, []);

  const fetchInfo = () => {
    dispatch(getInfo());
  };

  const { article = {}, factCheck = {}, loading } = info;
  const articlePublish = Number(article.publish) || 0;
  const articleDraft = Number(article.draft) || 0;
  const articleReady = Number(article.ready) || 0;
  const articleFuture = Number(article.future) || 0;
  const factCheckPublish = Number(factCheck.publish) || 0;
  const factCheckDraft = Number(factCheck.draft) || 0;
  const factCheckReady = Number(factCheck.ready) || 0;
  const factCheckFuture = Number(factCheck.future) || 0;

  if (loading) {
    return <Loader />;
  }

  return (
    <Space direction="vertical">
      <Helmet title={'Dashboard'} />
      <Typography.Title level={2}>Dashboard</Typography.Title>
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
                        <Statistic
                          value={articlePublish + articleDraft + articleReady + articleFuture}
                          loading={loading}
                        />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 6 }}>
                    <Card size="small" hoverable={true} title="Published">
                      <Link to="/posts?status=publish">
                        <Statistic value={articlePublish} loading={loading} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 7 }}>
                    <Card size="small" hoverable={true} title="Future publish">
                      <Link to="/posts?status=future">
                        <Statistic value={articleFuture} loading={loading} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 5 }}>
                    <Card size="small" hoverable={true} title="Draft">
                      <Link to="/posts?status=draft">
                        <Statistic value={articleDraft} loading={loading} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 8 }}>
                    <Card size="small" hoverable={true} title="Ready to publish">
                      <Link to="/posts?status=ready">
                        <Statistic value={articleReady} loading={loading} />
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
                        <Statistic
                          value={factCheckPublish + factCheckDraft + factCheckReady}
                          loading={loading}
                        />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 6 }}>
                    <Card size="small" hoverable={true} title="Published">
                      <Link to="/fact-checks?status=publish">
                        <Statistic value={factCheckPublish} loading={loading} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 7 }}>
                    <Card size="small" hoverable={true} title="Future publish">
                      <Link to="/fact-checks?status=future">
                        <Statistic value={factCheckFuture} loading={loading} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 5 }}>
                    <Card size="small" hoverable={true} title="Draft">
                      <Link to="/fact-checks?status=draft">
                        <Statistic value={factCheckDraft} loading={loading} />
                      </Link>
                    </Card>
                  </Col>
                  <Col md={{ span: 8 }}>
                    <Card size="small" hoverable={true} title="Ready to publish">
                      <Link to="/fact-checks?status=ready">
                        <Statistic value={factCheckReady} loading={loading} />
                      </Link>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default Dashboard;
