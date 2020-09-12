import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'antd';
import deepEqual from 'deep-equal';

function Selector({ mode, value, onChange, action, display = 'name', placeholder }) {
  const entity = action.toLowerCase();
  const selectorType = require(`../../actions/${entity}`);

  const [query, setQuery] = React.useState({
    page: 1,
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
      let j = state[entity].req.findIndex((item) => deepEqual(item.query, query));
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

    return { details, total: total, loading: state[entity].loading };
  });

  React.useEffect(() => {
    fetchEntities();
  }, [query]);

  const fetchEntities = () => {
    dispatch(selectorType['get' + action](query));
  };

  return (
    <Select
      bordered
      listHeight={128}
      loading={loading}
      mode={mode}
      defaultValue={value}
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
