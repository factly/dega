import React, { useState } from 'react';
import { AutoComplete } from 'antd';

const mockVal = (str, repeat = 1) => ({
  value: str.repeat(repeat),
});

const Search = () => {
  const [options, setOptions] = useState([]);

  const onSearch = (searchText) => {
    setOptions(
      !searchText ? [] : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)],
    );
  };

  const onSelect = (data) => {
    console.log('onSelect', data);
  };

  return (
    <AutoComplete
      options={options}
      style={{
        width: 400,
      }}
      onSelect={onSelect}
      onSearch={onSearch}
      placeholder="Search..."
    />
  );
};

export default Search;
