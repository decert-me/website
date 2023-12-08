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
import { useTranslation } from "react-i18next";

export default function Rating(params) {

    const judgRef = useRef(null);
    const navigateTo = useNavigate();
    const { t } = useTranslation(["rate"]);
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
            title: t("quest"),
            key: 'title',
            dataIndex: "title",
            width: "50%",
            render: (title) => (
                <p className="of-h">{title}</p>
            )
        },
        {
            title: t("status"),
            key: 'status',
            dataIndex: "open_quest_review_status",
            filters: [
                { text: t("all"), value: null },
                { text: t("rate"), value: 1 },
                { text: t("rated"), value: 2 },
            ],
            filterMultiple: false,
            filteredValue: [status],
            render: (status) => (
                <p style={{
                    color: status === 2 ? "#35D6A6" : "#9A9A9A",
                    fontWeight: 600
                }}>{status === 2 ? t("rated") : status === 1 ? t("rate") : t("all")}</p>
            )
        },
        Table.EXPAND_COLUMN
    ]

    const columns = [
        {
            title: t("rate"),
            key: 'title',
            dataIndex: "title",
            render: (title) => (
                <p className="of-h">{title}</p>
            )
        },
        {
            title: t("c-num"),
            key: 'token_id',
            dataIndex: "token_id"
        },
        {
            title: t("c-addr"),
            key: 'address',
            dataIndex: "address",
            render: (address) => address.substring(0,5) + "..." + address.substring(38,42)
        },
        {
            title: t("status"),
            key: 'status',
            dataIndex: "open_quest_review_status",
            filters: [
                { text: t("all"), value: null },
                { text: t("rate"), value: 1 },
                { text: t("rated"), value: 2 },
            ],
            filterMultiple: false,
            filteredValue: [status],
            render: (status) => (
                <p style={{
                    color: status === 2 ? "#35D6A6" : "#9A9A9A",
                    fontWeight: 600
                }}>{status === 2 ? t("rated") : status === 1 ? t("rate") : t("all")}</p>
            )
        },
        {
            title: t("submit-time"),
            key: 'updated_at',
            dataIndex: "updated_at",
            render: (time) => (
                time.indexOf("0001-01-01T") === -1 ?
                time.replace("T", " ").split(".")[0]
                :"-"
            )
        },
        {
            title: t("rate-time"),
            key: 'open_quest_review_time',
            dataIndex: "open_quest_review_time",
            render: (time) => (
                time.indexOf("0001-01-01T") === -1 ?
                time.replace("T", " ").split(".")[0]
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
                okText={t("submit")}
                cancelButtonProps={{
                    style: {
                        display: "none"
                    }
                }}
                okButtonProps={{
                    loading: isLoading
                }}
            >
                <RatingModal ref={judgRef} onFinish={onFinish} data={data} />
            </Modal>
            <div className="custom-bg-round"></div>
            <h2>{t("h1")}</h2>
            <Table
                columns={isMobile ? mobileColumns : columns}
                dataSource={data}
                rootClassName="custom-tabel"
                scroll={{ y: isMobile ? null : "calc(100vh - 414px)" }}
                onChange={handleChange}
                locale={{
                    filterReset: null,
                    filterConfirm: t("ok")
                }}
                expandable={isMobile && {
                    expandedRowRender: (record) => (
                        <div className="more-items">
                            <div className="item">
                                <p className="label">{t("c-num")}</p>
                                <p className="value">{record.token_id}</p>
                            </div>
                            <div className="item">
                                <p className="label">{t("c-addr")}</p>
                                <p className="value">{record.address.substring(0,5) + "..." + record.address.substring(38,42)}</p>
                            </div>
                            <div className="item">
                                <p className="label">{t("submit-time")}</p>
                                <p className="value">{
                                    record.updated_at.indexOf("0001-01-01T") === -1 ?
                                    record.updated_at.replace("T", " ").split(".")[0]
                                    :"-"
                                }</p>
                            </div>
                            <div className="item">
                                <p className="label">{t("rate-time")}</p>
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
                        <p style={{textAlign: "center"}}>{t("more")}</p>
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
                    <Button id="hover-btn-full" className="btn-start" onClick={() => {setIsModalOpen(true)}}>{t("btn-rate")}</Button>
                </div>
            }
        </div>
    );
}
