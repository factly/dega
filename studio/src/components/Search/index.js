import { Input, Modal, List, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getSearchDetails } from '../../actions/search';

function Search() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = useState({
    indexList: 0,
    indexItem: 0,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (query.length > 0) dispatch(getSearchDetails({ q: query }));
  }, [dispatch, query]);

  const searchEntites = ['articles', 'fact-checks', 'pages', 'claims', 'categories', 'tags'];

  const { data, total, entitiesLength } = useSelector(({ search }) => {
    const entitiesLength = searchEntites.map((each) => {
      return search.details[each].length;
    });
    return { data: search.details, total: search.total, entitiesLength: entitiesLength };
  });

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
        let indexList = selected.indexList;
        let indexItem = selected.indexItem;
        entitiesLength.forEach((length, index) => {
          if (selected.indexList === index && selected.indexItem < length - 1 && !isSet) {
            isSet = true;
            indexItem = selected.indexItem + 1;
          }
          if (!isSet && index > selected.indexList && length !== 0) {
            isSet = true;
            indexItem = 0;
            indexList = index;
          }
        });
        setSelected({ indexList, indexItem });
      }}
    >
      <Input onClick={(e) => setOpen(true)} />
      <Modal visible={open} footer={null} onOk={handleOk} onCancel={handleCancel} closable={false}>
        <div>
          <Input
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected({ indexList: 0, indexItem: 0 });
            }}
            placeholder={'search articles, fact-checks, claims, categories ...'}
          />
        </div>

        {total > 0 && query.length > 0 ? (
          <div style={{ height: 600, overflow: 'scroll' }}>
            {searchEntites.map((each, indexList) =>
              data[each].length > 0 ? (
                <List
                  key={each}
                  header={<h2>{each.toLocaleUpperCase()}</h2>}
                  dataSource={data[each]}
                  renderItem={(item, indexItem) => {
                    return (
                      <Link
                        to={`/${each === 'articles' ? 'posts' : each}/${item.id}/edit`}
                        onClick={() => setOpen(false)}
                      >
                        <List.Item
                          style={
                            indexItem === selected.indexItem && indexList === selected.indexList
                              ? { backgroundColor: '#5468ff', padding: 5 }
                              : {}
                          }
                        >
                          <Typography.Text
                            style={
                              indexItem === selected.indexItem && indexList === selected.indexList
                                ? { color: '#fff' }
                                : {}
                            }
                            onMouseOver={() => setSelected({ indexItem, indexList })}
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
        ) : null}
      </Modal>
    </div>
  );
}

export default Search;
