import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'antd';

function Selector({ mode, defaultIds = [], onBlur, action, display = 'name' }) {
  const entity = action.toLowerCase();
  const selectorType = require(`../../actions/${entity}`);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState([]);
  const dispatch = useDispatch();

  const { details, total, defaultValues, loading } = useSelector((state) => {
    let details = [];
    let total = 0;
    let ids = [];
    let defaultValues = [];

    for (var i = 1; i <= page; i++) {
      let j = state[entity].req.findIndex((item) => item.query.page === i);
      if (j > -1) {
        ids = ids.concat(state[entity].req[j].data);
      }
    }

    details = ids.map((id) => state[entity].details[id]);
    defaultValues = defaultIds
      .filter((id) => state[entity].details[id])
      .map((id) => state[entity].details[id]);

    total = state[entity].total;
    return { details, total, defaultValues, loading: state[entity].loading };
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
      defaultValue={defaultIds}
      placeholder={`Add ${entity}`}
      onChange={(values) => setSelected(values)}
      onBlur={() => onBlur(selected)}
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
      {defaultValues.length > 0
        ? defaultValues.map((item) => (
            <Select.Option value={item.id} key={entity + item.id}>
              {item.name}
            </Select.Option>
          ))
        : null}
      {total > 0
        ? details
            .filter((item) => !defaultValues.includes(item))
            .map((item) => (
              <Select.Option value={item.id} key={entity + item.id}>
                {item[display]}
              </Select.Option>
            ))
        : null}
    </Select>
  );
}

export default Selector;
