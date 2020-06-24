import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'antd';

function Selector({ mode, value, onChange, action, display = 'name' }) {
  const entity = action.toLowerCase();
  const selectorType = require(`../../actions/${entity}`);
  const [page, setPage] = React.useState(1);
  const dispatch = useDispatch();

  if (!value) {
    value = [];
  }

  if (!mode && value) {
    value = [value];
  }

  const { details, total, loading } = useSelector((state) => {
    let details = [];
    let ids = [];

    for (var i = 1; i <= page; i++) {
      let j = state[entity].req.findIndex((item) => item.query.page === i);
      if (j > -1) {
        ids = ids.concat(state[entity].req[j].data);
      }
    }

    details = value
      .filter((id) => state[entity].details[id])
      .map((id) => state[entity].details[id]);

    details = details.concat(
      ids.filter((id) => !value.includes(id)).map((id) => state[entity].details[id]),
    );

    return { details, total: state[entity].total, loading: state[entity].loading };
  });

  React.useEffect(() => {
    fetchEntities();
  }, [page]);

  const fetchEntities = () => {
    dispatch(selectorType['get' + action]({ page: page }));
  };

  return (
    <Select
      bordered
      listHeight={128}
      loading={loading}
      mode={mode}
      defaultValue={value}
      placeholder={`Add ${entity}`}
      onChange={(values) => onChange(values)}
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      onPopupScroll={(e) => {
        if (e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight) {
          if (details.length < total) {
            setPage(page + 1);
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
