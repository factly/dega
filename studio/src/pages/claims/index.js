/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Space, Button, Row, Col, Form, Input, Select } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import ClaimList from './components/ClaimList';
import { useDispatch, useSelector } from 'react-redux';
import deepEqual from 'deep-equal';
import Selector from '../../components/Selector';
import { getClaims } from '../../actions/claims';
import getUrlParams from '../../utils/getUrlParams';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import Filters from '../../utils/filters';

const { Option } = Select;

function Claims({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const { search } = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(search);

  const keys = ['page', 'limit', 'q', 'sort', 'rating', 'claimant'];
  const params = getUrlParams(query, keys);

  const [form] = Form.useForm();

  useEffect(() => {
    if (form) form.setFieldsValue(new Filters(params));
  }, [search]);

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  const fetchClaims = () => {
    dispatch(getClaims(params));
  };

  const { claims, total, loading } = useSelector((state) => {
    const node = state.claims.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node) {
      const list = node.data.map((element) => {
        let claim = state.claims.details[element];
        claim.claimant = state.claimants.details[claim.claimant_id].name;
        claim.rating = state.ratings.details[claim.rating_id].name;
        return claim;
      });
      return {
        claims: list,
        total: node.total,
        loading: state.claims.loading,
      };
    }
    return { claims: [], total: 0, loading: state.claims.loading };
  });

  const onSave = (values) => {
    let searchFilter = new URLSearchParams();
    Object.keys(values).forEach(function (key) {
      if (values[key]) {
        if (key === 'rating' || key === 'claimant') {
          values[key].map((each) => {
            return searchFilter.append(key, each);
          });
        } else {
          searchFilter.set(key, values[key]);
        }
      }
    });

    history.push({
      pathName: '/claims',
      search: '?' + searchFilter.toString(),
    });
  };

  const onPagination = (page, limit) => {
    query.set('limit', limit);
    query.set('page', page);
    history.push({
      pathName: '/claims',
      search: '?' + query.toString(),
    });
  };

  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Claims'} />
      <Form
        initialValues={params}
        form={form}
        name="filters"
        onFinish={(values) => onSave(values)}
        style={{ maxWidth: '100%' }}
        onValuesChange={(changedValues, allValues) => {
          if (!changedValues.q) {
            onSave(allValues);
          }
        }}
      >
        <Row justify="end" gutter={16}>
          <Col key={2} style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item name="q">
              <Input placeholder="search post" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="claimant" label="Claimants">
              <Selector mode="multiple" action="Claimants" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="rating" label="Ratings">
              <Selector mode="multiple" action="Ratings" />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="sort" style={{ width: '100%' }}>
              <Select>
                <Option value="desc">Sort By: Latest</Option>
                <Option value="asc">Sort By: Old</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col key={1}>
            <Link to="/claims/create">
              <Button
                disabled={!(actions.includes('admin') || actions.includes('create'))}
                type="primary"
              >
                New Claim
              </Button>
            </Link>
          </Col>
        </Row>
      </Form>
      <ClaimList
        actions={actions}
        data={{ claims: claims, total: total, loading: loading }}
        filters={params}
        fetchClaims={fetchClaims}
        onPagination={onPagination}
      />
    </Space>
  );
}

export default Claims;
