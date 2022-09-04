import React, { useState } from 'react';
import { Select, Form } from 'antd';
const { Option } = Select;

const Filter = ({ mode, defaultValue, optionsMap, placeholder, name, label, form }) => {
  const [selectedItems, setSelectedItems] = useState(optionsMap[defaultValue]);
  const filteredOptions = Object.keys(optionsMap).filter((o) => !selectedItems.includes(o));
  const selectedOptions = optionsMap[selectedItems];

  return (
    <Form.Item label={label} name={name}>
      <Select
        placeholder={placeholder}
        onChange={(value) => {
          form.setFieldsValue({ [name]: optionsMap[value] });
          setSelectedItems(value);
        }}
      >
        {filteredOptions.map((item, index) => {
          return (
            <Select.Option key={item} value={item}>
              {optionsMap[item]}
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export default Filter;
