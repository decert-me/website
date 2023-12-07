import "./index.scss";
import { useContext, useEffect, useState } from "react";
import { Button, Modal, Table } from "antd";
import {
    DownOutlined
  } from '@ant-design/icons';
import MyContext from "@/provider/context";
import RatingModal from "./modal";

export default function Rating(params) {

    const { isMobile } = useContext(MyContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState(1);
    let [data, setData] = useState([]);
    let [pageConfig, setPageConfig] = useState({
        page: 0,
        pageSize: 10,
        total: 0,
    });

    const mobileColumns = [
        {
            title: "题目",
            dataIndex: "lastName",
            width: "50%"
        },
        {
            title: "状态",
            dataIndex: "address1",
            filters: [
                { text: "待处理", value: 1 },
                { text: "已处理", value: 2 },
            ],
            filterMultiple: false,
            filteredValue: [status],
            align: "center",
            render: (status) => (
                <p style={{
                    color: status === 2 ? "#35D6A6" : "#9A9A9A",
                    fontWeight: 600
                }}>{status === 2 ? "已处理" : "待处理"}</p>
            )
        },
        // {
        //     title: "更多",
        //     key: 'more',
        //     align: "center",
        //     render: (_, quest) => (
        //         <>
        //             <Button className="btn-more"><DownOutlined /></Button>

        //         </>
        //     ),
        // }
        Table.EXPAND_COLUMN
    ]

    const columns = [
        {
            title: "题目",
            dataIndex: "lastName",
        },
        {
            title: "挑战编号",
            render: (_, record) => `Group ${Math.floor(record.id / 4)}`,
        },
        {
            title: "挑战者地址",
            dataIndex: "Age",
        },
        {
            title: "状态",
            dataIndex: "address1",
            filters: [
                { text: "待处理", value: 1 },
                { text: "已处理", value: 2 },
            ],
            filterMultiple: false,
            filteredValue: [status],
            render: (status) => (
                <p style={{
                    color: status === 2 ? "#35D6A6" : "#9A9A9A",
                    fontWeight: 600
                }}>{status === 2 ? "已处理" : "待处理"}</p>
            )
        },
        {
            title: "提交时间",
            dataIndex: "address2",
        },
        {
            title: "评分时间",
            dataIndex: "address3",
        }
    ];

    const getList = () => {
        const count = data.length + 100;
        data = new Array(count).fill(null).map((_, index) => ({
            id: index,
            firstName: `First_${index.toString(16)}`,
            lastName: `Last_${index.toString(16)}`,
            Age: 25 + (index % 10),
            address1: Math.random() > 0.5 ? 1 : 2,
            address2: `2023-07-28 15:55:08`,
            address3: `2023-07-28 15:55:08`,
            desc: "My name is Joe Black, I am 32 years old, living in Sydney No. 1 Lake Park."
        }));
        setData([...data]);
    };

    function handleOk() {
        console.log("提交 ===>");
    }

    function init() {
        pageConfig.page += 1;
        setPageConfig({ ...pageConfig });
        getList();
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div className="rating" >
            <Modal
                width={1177}
                open={isModalOpen}
                className="judg-modal"
                onCancel={() => {setIsModalOpen(false)}}
                onOk={handleOk}
            >
                {/* <ChallengeJudgPage ref={judgRef} selectQuest={selectQuest} onFinish={onFinish} /> */}
                <RatingModal />
            </Modal>
            <div className="custom-bg-round"></div>
            <h2>评分列表</h2>
            <Table
                columns={isMobile ? mobileColumns : columns}
                rowKey="id"
                dataSource={data || []}
                rootClassName="custom-tabel"
                scroll={{ y: isMobile ? null : "calc(100vh - 414px)" }}
                expandable={isMobile && {
                    expandedRowRender: (record) => (
                        <p style={{ margin: 0,}}> {record.desc} </p>
                    ),
                    expandIcon: ({ expanded, onExpand, record }) => (
                        <div className="btn-more" onClick={e => onExpand(record, e)}>
                            <DownOutlined className={expanded ? "active-icon" : ""} />
                        </div>
                    ),
                    columnTitle: (
                        <p style={{textAlign: "center"}}>更多</p>
                    ),
                    // columnWidth: "65px",
                    columnWidth: "auto"
                }}
                pagination={{
                    className: "custom-pagination",
                    showSizeChanger: false,
                    position: isMobile ? ["bottomCenter"] : ["bottomRight"]
                    // current: pageConfig.page, 
                    // total: pageConfig.total, 
                    // pageSize: pageConfig.pageSize, 
                    // onChange: (page) => {
                    //     page !== pageConfig.page && getList(page)
                    // }
                }}
            />
            <div className="flex">
                <Button id="hover-btn-full" className="btn-start" onClick={() => {setIsModalOpen(true)}}>开始评分</Button>
            </div>
        </div>
    );
}
