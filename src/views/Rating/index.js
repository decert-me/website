import "./index.scss";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Modal, Table } from "antd";
import {
    DownOutlined
  } from '@ant-design/icons';
import MyContext from "@/provider/context";
import RatingModal from "./modal";
import { getUserOpenQuestList } from "@/request/api/judg";
import { useNavigate } from "react-router-dom";

export default function Rating(params) {

    const judgRef = useRef(null);
    const navigateTo = useNavigate();
    const { isMobile } = useContext(MyContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    let [status, setStatus] = useState(1);
    let [isLoading, setIsLoading] = useState();
    let [data, setData] = useState([]);
    let [pageConfig, setPageConfig] = useState({
        page: 0,
        // pageSize: 1,
        pageSize: 10,
        total: 0,
    });

    const mobileColumns = [
        {
            title: "题目",
            key: 'title',
            dataIndex: "title",
            width: "50%"
        },
        {
            title: "状态",
            key: 'status',
            dataIndex: "open_quest_review_status",
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
        Table.EXPAND_COLUMN
    ]

    const columns = [
        {
            title: "题目",
            key: 'title',
            dataIndex: "title",
        },
        {
            title: "挑战编号",
            key: 'token_id',
            dataIndex: "token_id"
        },
        {
            title: "挑战者地址",
            key: 'address',
            dataIndex: "address",
            render: (address) => address.substring(0,5) + "..." + address.substring(38,42)
        },
        {
            title: "状态",
            key: 'status',
            dataIndex: "open_quest_review_status",
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
            key: 'updated_at',
            dataIndex: "updated_at",
            render: (time) => (
                time.indexOf("0001-01-01T") === -1 ?
                <p>{time.replace("T", " ").split(".")[0]}</p>
                :"-"
            )
        },
        {
            title: "评分时间",
            key: 'open_quest_review_time',
            dataIndex: "open_quest_review_time",
            render: (time) => (
                time.indexOf("0001-01-01T") === -1 ?
                <p>{time.replace("T", " ").split(".")[0]}</p>
                :"-"
            )
        }
    ];

    function onFinish() {
        setIsModalOpen(false)
        getList()
    }

    // 修改状态过滤
    const handleChange = (pagination, filters, sorter) => {
        const { pageSize } = pagination
        const newStatus = Array.isArray(filters.status) ? filters.status[0] : null;
        if (status !== newStatus) {
            status = newStatus;
            setStatus(newStatus);
            data = [];
            setData([...data]);
            getList(1);
        }
        if (pageSize !== pageConfig.pageSize) {
            pageConfig.pageSize = pageSize;
            setPageConfig({...pageConfig});
            getList();
        }
    };

    const getList = (page) => {
        if (page) {
            pageConfig.page = page;
            setPageConfig({...pageConfig});
        }
        getUserOpenQuestList({
            open_quest_review_status: status,
            ...pageConfig
        })
        .then(res => {
            const list = res.data.list;
            data = list ? list : [];
            // 添加key
            data.forEach((ele, index) => {
                ele.key = ele.updated_at + ele.index + index
            })
            setData([...data]);
            pageConfig.total = res.data.total;
            setPageConfig({...pageConfig});
        })
    };

    async function handleOk() {
        setIsLoading(true);
        await judgRef.current.confirm();
        setIsLoading(false);
    }

    function init() {
        pageConfig.page += 1;
        setPageConfig({ ...pageConfig });
        getList();
    }

    useEffect(() => {
        const token = localStorage.getItem("decert.token");
        token ? init() : navigateTo("/");
    }, []);

    return (
        <div className="rating" >
            <Modal
                width={1177}
                className={`judg-modal ${isMobile ? "mobile-judg-modal" : ""}`}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => {setIsModalOpen(false)}}
                cancelButtonProps={{
                    style: {
                        display: "none"
                    }
                }}
                okButtonProps={{
                    loading: isLoading
                }}
            >
                {/* <ChallengeJudgPage ref={judgRef} selectQuest={selectQuest}  /> */}
                <RatingModal ref={judgRef} onFinish={onFinish} data={data?.filter(e => e.open_quest_review_status === 1)} />
            </Modal>
            <div className="custom-bg-round"></div>
            <h2>评分列表</h2>
            <Table
                columns={isMobile ? mobileColumns : columns}
                dataSource={data}
                rootClassName="custom-tabel"
                scroll={{ y: isMobile ? null : "calc(100vh - 414px)" }}
                onChange={handleChange}
                locale={{
                    filterReset: "重置",
                    filterConfirm: "确定",
                    // emptyText: "无数据"
                }}
                expandable={isMobile && {
                    expandedRowRender: (record) => (
                        <div className="items">
                            <div className="item">
                                <p className="label">挑战编号</p>
                                <p className="value">{record.token_id}</p>
                            </div>
                            <div className="item">
                                <p className="label">挑战者地址</p>
                                <p className="value">{record.address.substring(0,5) + "..." + record.address.substring(38,42)}</p>
                            </div>
                            <div className="item">
                                <p className="label">提交时间</p>
                                <p className="value">{
                                    record.updated_at.indexOf("0001-01-01T") === -1 ?
                                    record.updated_at.replace("T", " ").split(".")[0]
                                    :"-"
                                }</p>
                            </div>
                            <div className="item">
                                <p className="label">评分时间</p>
                                <p className="value">{record.open_quest_review_time}</p>
                            </div>
                        </div>
                    ),
                    expandIcon: ({ expanded, onExpand, record }) => (
                        <div className="btn-more" onClick={e => onExpand(record, e)}>
                            <DownOutlined className={expanded ? "active-icon" : ""} />
                        </div>
                    ),
                    columnTitle: (
                        <p style={{textAlign: "center"}}>更多</p>
                    ),
                    columnWidth: "auto"
                }}
                pagination={{
                    className: "custom-pagination",
                    showSizeChanger: false,
                    position: isMobile ? ["bottomCenter"] : ["bottomRight"],
                    current: pageConfig.page, 
                    total: pageConfig.total, 
                    pageSize: pageConfig.pageSize, 
                    onChange: (page) => {
                        page !== pageConfig.page && getList(page)
                    }
                }}
            />
            {
                data?.findIndex((e) => e.open_quest_review_status === 1) !== -1 &&
                <div className="flex">
                    <Button id="hover-btn-full" className="btn-start" onClick={() => {setIsModalOpen(true)}}>开始评分</Button>
                </div>
            }
        </div>
    );
}
