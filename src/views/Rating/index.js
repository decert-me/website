import "./index.scss";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Modal, Radio, Space, Table } from "antd";
import { DownOutlined, CloseOutlined } from '@ant-design/icons';
import MyContext from "@/provider/context";
import RatingModal from "./modal";
import { getUserOpenQuestList } from "@/request/api/judg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { confirm } = Modal;

export default function Rating(params) {

    const judgRef = useRef(null);
    const navigateTo = useNavigate();
    const { t } = useTranslation(["rate"]);
    const { isMobile } = useContext(MyContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    let [detail, setDetail] = useState([]);
    let [status, setStatus] = useState(1);
    let [select, setSelect] = useState();
    let [isLoading, setIsLoading] = useState();
    let [tableLoad, setTableLoad] = useState();
    let [data, setData] = useState([]);
    let [rateNum, setRateNum] = useState();
    let [pageConfig, setPageConfig] = useState({
        page: 0,
        pageSize: 10,
        total: 0,
    });

    const fillter = (confirm) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column"
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
            <Radio.Group 
                style={{
                    padding: "4px"
                }}
                onChange={(e) => {
                    select = e.target.value;
                    setSelect(select);
                }} 
                value={select !== undefined ? select : status}>
                <Space direction="vertical" style={{padding: "5px 12px"}}>
                    <Radio value={null}>{t("all")}</Radio>
                    <Radio value={1}>{t("rate")}</Radio>
                    <Radio value={2}>{t("rated")}</Radio>
                </Space>
            </Radio.Group>
            <div className="ant-table-filter-dropdown-btns" >
                <button></button>
                <Button size="small" onClick={() => {
                    handleConfirm();
                    confirm();
                }}>{t("ok")}</Button>
            </div>
        </div>
    )

    const mobileColumns = [
        {
            title: t("quest"),
            key: 'title',
            dataIndex: "title",
            width: "50%",
            render: (title, quest) => (
                <p className="of-h" onClick={() => openDetail(quest)}>{title}</p>
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
            filterDropdown: ({ confirm }) => fillter(confirm),
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
            title: t("quest"),
            key: 'title',
            dataIndex: "title",
            render: (title, quest) => (
                <p className="of-h pointer" onClick={() => openDetail(quest)}>{title}</p>
            )
        },
        {
            title: t("c-num"),
            key: 'token_id',
            dataIndex: "token_id",
            render: (token_id) => (
                <p className="pointer" onClick={() => window.open(`/quests/${token_id}`, "_blank")}>{token_id}</p>
            )
        },
        {
            title: t("c-addr"),
            key: 'address',
            dataIndex: "address",
            render: (address) => (
                <p className="pointer" onClick={() => window.open(`/${address}`, "_blank")}>{address.substring(0,5) + "..." + address.substring(38,42)}</p>
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
            filterDropdown: ({ confirm }) => fillter(confirm),
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

    function handleConfirm() {
        status = select;
        setStatus(status);
        setSelect(undefined);

        data = [];
        setData([...data]);
        getList(1);
    }

    // 展示该题详情
    function openDetail(quest) {
        detail = [quest];
        setDetail([...detail]);
        setDetailOpen(true);
    }

    function onFinish() {
        setIsModalOpen(false)
        getList()
    }

    // 修改状态过滤
    const handleChange = (pagination, filters, sorter) => {
        const { pageSize } = pagination
        // const newStatus = Array.isArray(filters.status) ? filters.status[0] : null;
        // if (status !== newStatus) {
        //     status = newStatus;
        //     setStatus(newStatus);
        //     data = [];
        //     setData([...data]);
        //     getList(1);
        // }
        if (pageSize !== pageConfig.pageSize) {
            pageConfig.pageSize = pageSize;
            setPageConfig({...pageConfig});
            getList();
        }
    };

    const getList = async(page) => {
        setTableLoad(true);
        if (page) {
            pageConfig.page = page;
            setPageConfig({...pageConfig});
        }
        await getUserOpenQuestList({
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
            if (!rateNum) {
                rateNum = pageConfig.total;
                setRateNum(rateNum);
            }
            setPageConfig({...pageConfig});
        })
        setTableLoad(false);
    };

    // 提交批改内容
    async function submitReview(params) {
        setIsLoading(true);
        await judgRef.current.confirm();
        setIsLoading(false);
    }

    function handleOk() {
        // 是否批改完
        const {flag, remain} = judgRef.current.isOver();
        if (flag) {
            submitReview()
        }else{
            confirm({
                title: "",
                className: "confirm-modal",
                icon: <></>,
                content: (
                    <>
                    <CloseOutlined style={{position: "absolute", right: 20, top: 20}} />   
                    {t("confirm.submit", {num: remain})}
                    </>
                ),
                okText: t("submit"),
                cancelText: t("cancel"),
                onOk() {
                    submitReview()
                },
            });
        }
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
            {/* rateModal */}
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
                <RatingModal ref={judgRef} onFinish={onFinish} data={data} isMobile={isMobile} />
            </Modal>

            {/* detailModal */}
            <Modal
                width={1177}
                className={`judg-modal ${isMobile ? "mobile-judg-modal" : ""}`}
                open={detailOpen}
                footer={null}
                onCancel={() => {setDetailOpen(false)}}
            >
                <RatingModal data={detail} isMobile={isMobile} />
            </Modal>

            <div className="custom-bg-round"></div>
            <h2>{t("h1")}&nbsp;&nbsp;<span>({t("rate")} {rateNum})</span></h2>
            <Table
                columns={isMobile ? mobileColumns : columns}
                dataSource={data}
                rootClassName="custom-tabel"
                scroll={{ y: isMobile ? null : "calc(100vh - 414px)" }}
                onChange={handleChange}
                loading={tableLoad}
                locale={{
                    filterReset: null,
                    filterConfirm: t("ok")
                }}
                expandable={isMobile && {
                    expandedRowRender: (record) => (
                        <div className="more-items">
                            <div className="item" onClick={() => window.open(`/quests/${record.token_id}`, "_blank")}>
                                <p className="label">{t("c-num")}</p>
                                <p className="value">{record.token_id}</p>
                            </div>
                            <div className="item" onClick={() => window.open(`/${record.address}`, "_blank")}>
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
