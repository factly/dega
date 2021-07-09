/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Space, Button, Row, Col, Form, Input, Select } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import ClaimList from './components/ClaimList';
import { useDispatch, useSelector } from 'react-redux';
import deepEqual from 'deep-equal';
import Selector from '../../components/Selector';
import { getClaims } from '../../actions/claims';

function Claims({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(location.search);

  const params = {};
  const keys = ['page', 'limit', 'q', 'sort', 'rating', 'claimant'];
  keys.forEach((key) => {
    if (query.get(key)) {
      if (key === 'claimant' || key === 'rating') {
        const val = query.getAll(key).map((v) => parseInt(v));
        params[key] = val;
      } else if (key === 'sort' || key === 'q') {
        params[key] = query.get(key);
      } else {
        params[key] = parseInt(query.get(key));
      }
    }
  });
  const [filters, setFilters] = React.useState({
    ...params,
  });
  const pathName = useLocation().pathname;
  let searchFilter = new URLSearchParams(useLocation().search);

  React.useEffect(() => {
    keys.forEach((key) => {
      searchFilter.has(key) ? searchFilter.delete(key) : null;
    });
    Object.keys(filters).forEach(function (key) {
      if (key === 'claimant' || key === 'rating') {
        searchFilter.delete(key);
        filters[key].map((each) => {
          searchFilter.append(key, each);
        });
      } else {
        searchFilter.set(key, filters[key]);
      }
    });
    history.push({
      pathName: pathName,
      search: '?' + searchFilter.toString(),
    });
  }, [history, filters]);
  const [form] = Form.useForm();
  const { Option } = Select;

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

  React.useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchClaims = () => {
    dispatch(getClaims(filters));
  };

  const onSave = (values) => {
    let filterValue = {};
    if (values.status === 'all') {
      values.status = null;
    }
    Object.keys(values).forEach(function (key) {
      if (values[key]) {
        if (key === 'rating' || key === 'claimant') {
          if (values[key].length > 0) {
            filterValue[key] = values[key];
          }
        } else {
          filterValue[key] = values[key];
        }
      }
    });
    setFilters(filterValue);
  };

  return (
    <Space direction="vertical">
      <Form
        initialValues={filters}
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
        <Row gutter={24}>
          <Col key={1}>
            <Link to="/claims/create">
              <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
                Create New
              </Button>
            </Link>
          </Col>
          <Col key={2} span={9} offset={12}>
            <Space direction="horizontal">
              <Form.Item name="q">
                <Input placeholder="search post" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit">Search</Button>
              </Form.Item>
              <Form.Item name="sort" label="Sort" style={{ width: '100%' }}>
                <Select defaultValue="desc">
                  <Option value="desc">Latest</Option>
                  <Option value="asc">Old</Option>
                </Select>
              </Form.Item>
            </Space>
          </Col>
        </Row>
        <Row gutter={2}>
          <Col span={5}>
            <Form.Item name="claimant" label="Claimants">
              <Selector mode="multiple" action="Claimants" />
            </Form.Item>
          </Col>
          <Col span={5} offset={1}>
            <Form.Item name="rating" label="Ratings">
              <Selector mode="multiple" action="Ratings" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <ClaimList
        actions={actions}
        data={{ claims: claims, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchClaims={fetchClaims}
      />
    </Space>
  );
}

export default Claims;
