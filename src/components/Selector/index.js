import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select, Empty, Button } from 'antd';
import deepEqual from 'deep-equal';

function Selector({
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

  const [query, setQuery] = React.useState({
    page: 1,
    limit: 5,
  });
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
      setQuery({ ...query, q: value });
    } else {
      setQuery({ page: query.page });
    }
  };

  const { details, total, loading } = useSelector((state) => {
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

    return { details, total: total, loading: state[entity].loading };
  });

  React.useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchEntities = () => {
    dispatch(selectorType['get' + action](query));
  };

  return (
    <Select
      allowClear={mode === 'mutliple' ? false : true}
      bordered
      listHeight={128}
      loading={loading}
      mode={mode}
      defaultValue={value}
      style={style}
      placeholder={placeholder}
      onChange={(values) => onChange(values)}
      onSearch={(value) => onSearch(value)}
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      onPopupScroll={(e) => {
        if (e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight) {
          if (details.length < total) {
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
                selectorType['add' + createEntity]({
                  name: query.q.trim(),
                }),
              ).then(() => setQuery({ page: 1 }))
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
    >
      {details.map((item) => (
        <Select.Option value={item.id} key={entity + item.id}>
          {item[display]}
        </Select.Option>
      ))}
    </Select>
  );
}

export default Selector;
