import React from 'react';
import { Button, Segmented, Space, Switch, Table, Typography } from 'antd';
const fixedColumns = [
  {
    title: '题目（开放题题目）',
    dataIndex: 'lastName',
    width: 120,
    fixed: 'left',
  },
  {
    title: '挑战编号',
    width: 120,
    render: (_, record) => `Group ${Math.floor(record.id / 4)}`,
    // onCell: (record) => ({
    //   rowSpan: record.id % 4 === 0 ? 4 : 0,
    // }),
  },
  {
    title: '挑战者地址',
    dataIndex: 'Age',
    width: 100,
    // onCell: (record) => ({
    //   colSpan: record.id % 4 === 0 ? 2 : 1,
    // }),
  },
  {
    title: '状态',
    dataIndex: 'address1',
    // onCell: (record) => ({
    //   colSpan: record.id % 4 === 0 ? 0 : 1,
    // }),
  },
  {
    title: '提交时间',
    dataIndex: 'address2',
  },
  {
    title: '评分时间',
    dataIndex: 'address3',
  },
  {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: () => (
      <Space>
        <Typography.Link>Action1</Typography.Link>
      </Space>
    ),
  },
];
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 100,
  },
  {
    title: 'FistName',
    dataIndex: 'firstName',
    width: 120,
  },
  {
    title: 'LastName',
    dataIndex: 'lastName',
    width: 120,
  },
];
const getData = (count) => {
  const data = new Array(count).fill(null).map((_, index) => ({
    id: index,
    firstName: `First_${index.toString(16)}`,
    lastName: `Last_${index.toString(16)}`,
    age: 25 + (index % 10),
    address1: `New York No. ${index} Lake Park`,
    address2: `London No. ${index} Lake Park`,
    address3: `Sydney No. ${index} Lake Park`,
  }));
  return data;
};
export default function Rating(params) {

  const [fixed, setFixed] = React.useState(true);
  const [bordered, setBordered] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [empty, setEmpty] = React.useState(false);
  const [count, setCount] = React.useState(10000);
  const tblRef = React.useRef(null);
  const data = React.useMemo(() => getData(count), [count]);
  const mergedColumns = React.useMemo(() => {
    if (!fixed) {
      return columns;
    }
    if (!expanded) {
      return fixedColumns;
    }
    return fixedColumns.map((col) => ({
      ...col,
      onCell: undefined,
    }));
  }, [expanded, fixed]);
  const expandableProps = React.useMemo(() => {
    if (!expanded) {
      return undefined;
    }
    return {
      columnWidth: 48,
      expandedRowRender: (record) => (
        <p
          style={{
            margin: 0,
          }}
        >
          🎉 Expanded {record.address1}
        </p>
      ),
      rowExpandable: (record) => record.id % 2 === 0,
    };
  }, [expanded]);

  return (
    <div
      style={{
        padding: 64,
        marginTop: "100px"
      }}
    >
      <Space
        direction="vertical"
        style={{
          width: '100%',
        }}
      >
        <Table
          bordered={bordered}
          virtual
          columns={mergedColumns}
          scroll={{
            x: 2000,
            y: 400,
          }}
          rowKey="id"
          dataSource={empty ? [] : data}
          pagination={false}
          ref={tblRef}
          rowSelection={
            expanded
              ? undefined
              : {
                  type: 'radio',
                  columnWidth: 48,
                }
          }
          expandable={expandableProps}
        />
      </Space>
    </div>
  );
};