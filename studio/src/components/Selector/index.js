import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select, Empty, Button } from 'antd';
import deepEqual from 'deep-equal';

function Selector({
  invalidOptions = [],
  setLoading = true,
  mode,
  createEntity,
  value,
  onChange,
  action,
  display = 'name',
  placeholder,
  style,
}) {
  const entity = action.toLowerCase();
  const selectorType = require(`../../actions/${entity}`);
  const [entityCreatedFlag, setEntityCreatedFlag] = React.useState(false);
  const [query, setQuery] = React.useState({
    page: 1,
    limit: 5,
  });
  const [searchValue, setSearchValue] = useState('');
  const dispatch = useDispatch();

  if (!value) {
    value = [];
  }

  if (!mode && value) {
    value = [value];
  }

  if (!placeholder) {
    placeholder = `Select ${entity}`;
  }

  const onSearch = (value) => {
    if (value) {
      setSearchValue(value);
      setQuery({ q: value, page: 1, limit: 5 });
    } else {
      setSearchValue('');
      setQuery({ page: query.page });
    }
  };

  const { details, total, loading, ids } = useSelector((state) => {
    let details = [];
    let ids = [];
    let total = 0;

    for (var i = 1; i <= query.page; i++) {
      let j = state[entity].req.findIndex((item) => deepEqual(item.query, { ...query, page: i }));
      if (j > -1) {
        total = state[entity].req[j].total;
        ids = ids.concat(state[entity].req[j].data);
      }
    }

    details = value
      .filter((id) => state[entity].details[id])
      .map((id) => state[entity].details[id]);

    details = details.concat(
      ids.filter((id) => !value.includes(id)).map((id) => state[entity].details[id]),
    );

    if (action === 'Organisations') {
      const req = state[entity].req;

      if (req.length > 0 && req[0].total > 0) {
        const details = Object.keys(state[entity].details)
          .map((key, index) => {
            return !state[entity].details[key].permission ? state[entity].details[key] : undefined;
          })
          .filter((each) => each);
        return {
          details: details.slice(query.page - 1, 5 + (query.page - 1) * 5),
          total: details.total,
          loading: state[entity].loading,
        };
      }
    }

    return { details, total: total, loading: state[entity].loading, ids };
  });

  if (entityCreatedFlag && !loading && entity) {
    value.push(ids[0]);
    setEntityCreatedFlag(false);
  }
  React.useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchEntities = () => {
    if (!setLoading) {
      dispatch(selectorType['get' + action](query, setLoading));
      return;
    }
    dispatch(selectorType['get' + action](query));
  };

  return (
    <Select
      allowClear={true}
      bordered
      listHeight={128}
      loading={loading}
      mode={mode}
      defaultValue={value}
      style={style}
      searchValue={searchValue}
      value={value}
      placeholder={placeholder}
      onChange={(values) => onChange(values)}
      onSearch={(value) => onSearch(value)}
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      onPopupScroll={(e) => {
        if (
          e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight ||
          e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 16
        ) {
          if (details.length < total && Math.ceil(total / query.limit) >= query.page + 1) {
            setQuery({ ...query, page: query.page + 1 });
          }
        }
      }}
      notFoundContent={
        query.q?.trim() && createEntity ? (
          <Button
            block
            type="dashed"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            onClick={() =>
              dispatch(
                selectorType['create' + createEntity]({
                  name: query.q.trim(),
                }),
              ).then(() => setQuery({ page: 1 }), setEntityCreatedFlag(true), setSearchValue(''))
            }
          >
            Create a {createEntity} '{query.q}'
          </Button>
        ) : createEntity ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`No ${entity} available. Type something to create new ${createEntity}`}
          />
        ) : null
      }
      getPopupContainer={(trigger) => trigger.parentNode}
      autoClearSearchValue={true}
    >
      {details
        .filter((item) => !invalidOptions.includes(item?.id))
        .map((item) => (
          <Select.Option value={item?.id} key={entity + item?.id}>
            {item?.[display] ? item?.[display] : item?.['email'] ? item?.['email'] : null}
          </Select.Option>
        ))}
    </Select>
  );
}

export default Selector;
