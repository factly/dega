import React, { useEffect, useRef, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { Avatar, Button, Row, Col, Modal, Layout, Input, List, Typography, Empty } from 'antd';
import { LeftOutlined, PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { setSelectedSpace } from '../../actions/spaces';
import { Link } from 'react-router-dom';
import { deleteSpace } from '../../actions/spaces';
import degaImg from '../../assets/dega.png';
import './SpaceSelector.css';

const ListsStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#F9FAFB',
  color: '#1E1E1E',
};

function SpaceSelector({ onClose }) {
  const { orgs, details } = useSelector((state) => {
    // orgs with spaces
    const orgsSpaces = state.spaces.orgs.filter((org) => org.spaces.length > 0);
    // orgs without spaces
    const orgsNoSpaces = state.spaces.orgs.filter((org) => org.spaces.length === 0);
    return {
      orgs: [...orgsSpaces, ...orgsNoSpaces],
      details: state.spaces.details,
    };
  });
  const [searchquery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const dispatch = useDispatch();
  const { Header, Content } = Layout;

  const onSearch = (e) => {
    setSearchQuery(e.target.value);

    if (e.target.value.length > 0) {
      filterData(e.target.value);
    }
  };

  const filterData = (query) => {
    // Initialize an empty array to store the search results
    let results = [];

    // Loop through each organization in the `orgs` array
    for (const org of orgs) {
      // Initialize an empty array to store the spaces that match the search query
      const matchingSpaces = [];

      // Loop through each space associated with the current organization
      for (const space of org.spaces) {
        // Check if the name of the current space contains the search query
        if (details[space].name.toLowerCase().includes(query.toLowerCase())) {
          // If it does, add the space to the `matchingSpaces` array
          matchingSpaces.push(space);
        }
      }

      // Check if the name of the current organization contains the search query
      const orgTitleMatches = org.title.toLowerCase().includes(query.toLowerCase());

      // Check if any spaces matched the search query and the current organization title matches
      if (matchingSpaces.length > 0 && orgTitleMatches) {
        // If so, add the current organization to the `results` array
        results.push({ ...org, spaces: matchingSpaces });
      } else if (matchingSpaces.length > 0) {
        // If only the spaces matched, create a new object with the matching spaces
        results.push({ ...org, spaces: matchingSpaces });
      } else if (orgTitleMatches) {
        // If only the organization title matched, add the current organization to the `results` array
        results.push(org);
      }
    }

    // Set the search results to the `results` array
    setSearchResults(results);
  };

  const OrgSpaceList = ({ org }) => {
    return (
      <div key={org.id + org.title} className="org-space-list-container">
        <List
          className="org-space-list"
          header={
            searchquery && org.title.toLowerCase().includes(searchquery.toLowerCase()) ? (
              <Typography.Text strong className="space-list-header">
                {org.title.split(new RegExp(`(${searchquery})`, 'gi')).map((text, i) =>
                  text.toLowerCase() === searchquery.toLowerCase() ? (
                    <span key={i} className="highlighted-text">
                      {text}
                    </span>
                  ) : (
                    <span key={i}>{text}</span>
                  ),
                )}
              </Typography.Text>
            ) : (
              <Typography.Text strong className="space-list-header">
                {org.title}
              </Typography.Text>
            )
          }
          dataSource={org.spaces}
          renderItem={(item) => (
            <List.Item
              className="list-item"
              onClick={() => {
                dispatch(setSelectedSpace(details[item]));
                onClose();
              }}
            >
              <List.Item.Meta
                className="list-item-meta"
                avatar={
                  <Avatar
                    src={
                      details[item]?.logo?.url?.[
                        window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw'
                      ] || degaImg
                    }
                  />
                }
                description={
                  searchquery &&
                  details[item].name.toLowerCase().includes(searchquery.toLowerCase()) ? (
                    <Typography.Text strong>
                      {details[item].name
                        .split(new RegExp(`(${searchquery})`, 'gi'))
                        .map((text, i) =>
                          text.toLowerCase() === searchquery.toLowerCase() ? (
                            <span key={i} className="highlighted-text">
                              {text}
                            </span>
                          ) : (
                            <span key={i}>{text}</span>
                          ),
                        )}
                    </Typography.Text>
                  ) : (
                    <Typography.Text strong>{details[item].name}</Typography.Text>
                  )
                }
              />
              <Button
                className="list-item-action"
                icon={<DeleteOutlined />}
                type="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  setItemToDelete(item);
                  setModalOpen(true);
                }}
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <Layout style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <Content>
        <Row
          style={{ width: '100%', alignItems: 'baseline', marginTop: '2.6rem' }}
          justify="space-between"
        >
          <Col span={2} style={{ textAlign: 'right' }}>
            <Link to="/" onClick={onClose} style={{ color: '#1E1E1E' }}>
              <LeftOutlined style={{ fontSize: '12px', paddingRight: '6px' }} />{' '}
              <Typography.Text strong>Home</Typography.Text>
            </Link>
          </Col>
          <Col
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              alignSelf: 'start',
              width: '45.27vw',
            }}
          >
            <Input
              value={searchquery}
              onChange={onSearch}
              placeholder="Search"
              style={{ padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}
              suffix={<SearchOutlined />}
            />
            <Row style={{ width: '100%', color: '1E1E1E' }}>
              {modalOpen && itemToDelete ? (
                <Modal
                  open={modalOpen}
                  closable={false}
                  centered
                  width="311px"
                  className="delete-modal-container"
                  style={{
                    borderRadius: '18px',
                  }}
                  onOk={() => {
                    dispatch(deleteSpace(itemToDelete));
                    setModalOpen(false);
                    setItemToDelete(null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  onCancel={() => {
                    setModalOpen(false);
                  }}
                >
                  <Typography.Text strong>
                    Are you sure you want to delete this space?
                  </Typography.Text>
                </Modal>
              ) : null}
              {searchquery.length < 1 ? (
                orgs.map((org) => {
                  return (
                    <Col span={24}>
                      <OrgSpaceList org={org} />
                    </Col>
                  );
                })
              ) : searchResults.length !== 0 ? (
                searchResults.map((item) => {
                  return (
                    <Col span={24}>
                      <OrgSpaceList org={item} />
                    </Col>
                  );
                })
              ) : (
                <Col span={24}>
                  <Empty />
                </Col>
              )}
            </Row>
          </Col>
          <Col span={3}>
            <Link Link key="1" onClick={onClose} to="/admin/spaces/create">
              <Button
                icon={<PlusOutlined />}
                size="large"
                style={{
                  backgroundColor: '#1890FF',
                  borderRadius: '4px',
                }}
                type="primary"
              >
                New Space
              </Button>
            </Link>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
export default SpaceSelector;
