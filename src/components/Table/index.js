import React from 'react';
import EditableCell from './EditableCell';
import { Table as AntTable } from 'antd';

function Table({ columns, data, loading }) {
  return (
    <AntTable
      components={{
        body: {
          cell: EditableCell,
        },
      }}
      bordered
      columns={columns}
      dataSource={data}
      loading={loading}
      rowClassName="editable-row"
    />
  );
}

// export { EditableCell };
export default Table;
