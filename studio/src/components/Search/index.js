import { Input, Modal, List, Typography, Empty, Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { getSearchDetails } from '../../actions/search';

function Search({ collapsed, Icon }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = useState({
    entityIndex: 0,
    indexItem: 0,
  });
  const inputRef = useRef(null);
  const dispatch = useDispatch();

  const searchEntities = ['articles', 'fact-checks', 'pages', 'claims', 'categories', 'tags'];

  const { data, total, entitiesLength } = useSelector(({ search }) => {
    const entitiesLength = searchEntities.map((entity) => {
      return search.details[entity].length;
    });
    return { data: search.details, total: search.total, entitiesLength: entitiesLength };
  });

  useEffect(() => {
    if (query.length > 0) dispatch(getSearchDetails({ q: query }));
  }, [dispatch, query]);

  const handleOk = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div
      onKeyDown={() => {
        let isSet = false;
        let entityIndex = selected.entityIndex;
        let indexItem = selected.indexItem;
        entitiesLength.forEach((length, index) => {
          if (selected.entityIndex === index && selected.indexItem < length - 1 && !isSet) {
            isSet = true;
            indexItem = selected.indexItem + 1;
          }
          if (!isSet && index > selected.entityIndex && length !== 0) {
            isSet = true;
            indexItem = 0;
            entityIndex = index;
          }
        });
        setSelected({ entityIndex, indexItem });
      }}
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      {!collapsed ? (
        <Input
          suffix={<SearchOutlined style={{ fontSize: collapsed ? '16px' : '20px' }} />}
          onClick={(e) => {
            setOpen(true);
            setTimeout(() => inputRef.current.focus(), 0); // antd dialog prevents using inputRef directly, don't modify this while refactoring dega studio
          }}
          style={{
            borderRadius: '8px',
            padding: '12px, 14px, 12px, 6px',
            width: '100%',
            height: '36px',
          }}
          placeholder={'Search..'}
        />
      ) : (
        Icon ? (
          <Button type="text" style={{ padding: '0px' }}
            icon={<Icon />}
            onClick={(e) => { setOpen(true); setTimeout(() => inputRef.current.focus(), 0); }}
          />
        )
          : <SearchOutlined
            onClick={(e) => {
              setOpen(true);
              setTimeout(() => inputRef.current.focus(), 0); // antd dialog prevents using inputRef directly, don't modify this while refactoring dega studio
            }}
            style={{ fontSize: collapsed ? '16px' : '20px', margin: '4px 0' }}
          />
      )}
      <Modal visible={open} footer={null} onOk={handleOk} onCancel={handleCancel} closable={false}>
        <div>
          <Input
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected({ entityIndex: 0, indexItem: 0 });
            }}
            ref={inputRef}
            placeholder={'search articles, fact-checks, claims, categories ...'}
          />
        </div>

        {query.length > 0 &&
          (total > 0 ? (
            <div style={{ height: 600, overflow: 'scroll', marginTop: '1rem' }}>
              {searchEntities.map((entity, entityIndex) =>
                data[entity].length > 0 ? (
                  <List
                    key={entity}
                    header={<h2>{entity.toLocaleUpperCase()}</h2>}
                    dataSource={data[entity]}
                    renderItem={(item, indexItem) => {
                      return (
                        <Link
                          to={`/${entity === 'articles' ? 'posts' : entity}/${item.id}/edit`}
                          onClick={() => setOpen(false)}
                        >
                          <List.Item
                            style={
                              indexItem === selected.indexItem &&
                                entityIndex === selected.entityIndex
                                ? { backgroundColor: '#5468ff', padding: 5 }
                                : {}
                            }
                          >
                            <Typography.Text
                              style={
                                indexItem === selected.indexItem &&
                                  entityIndex === selected.entityIndex
                                  ? { color: '#fff' }
                                  : {}
                              }
                              onMouseOver={() => setSelected({ indexItem, entityIndex })}
                            >
                              {item.title || item.name || item.claim}
                            </Typography.Text>
                          </List.Item>
                        </Link>
                      );
                    }}
                  />
                ) : null,
              )}
            </div>
          ) : (
            <Empty style={{ marginTop: '2rem' }} description="No Results Found" />
          ))}
      </Modal>
    </div>
  );
}

export default Search;
