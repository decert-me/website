import "./index.scss";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Modal, Radio, Space, Table } from "antd";
import { DownOutlined, CloseOutlined } from "@ant-design/icons";
import MyContext from "@/provider/context";
import RatingModal from "./modal";
import { getUserOpenQuestList } from "@/request/api/judg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { coverTimestamp } from "@/utils/convert";

const { confirm } = Modal;

export default function Rating(params) {
    const judgRef = useRef(null);
    const reviewRef = useRef(null);
    const navigateTo = useNavigate();
    const { t } = useTranslation(["rate"]);
    const { isMobile } = useContext(MyContext);
    const [detailOpen, setDetailOpen] = useState(false);
    let [modalInfo, setModalInfo] = useState(null); //  弹窗详情
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
                flexDirection: "column",
            }}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <Radio.Group
                style={{
                    padding: "4px",
                }}
                onChange={(e) => {
                    select = e.target.value;
                    setSelect(select);
                }}
                value={select !== undefined ? select : status}
            >
                <Space direction="vertical" style={{ padding: "5px 12px" }}>
                    <Radio value={null}>{t("all")}</Radio>
                    <Radio value={1}>{t("rate")}</Radio>
                    <Radio value={2}>{t("rated")}</Radio>
                </Space>
            </Radio.Group>
            <div className="ant-table-filter-dropdown-btns">
                <button></button>
                <Button
                    size="small"
                    onClick={() => {
                        handleConfirm();
                        confirm();
                    }}
                >
                    {t("ok")}
                </Button>
            </div>
        </div>
    );

    const mobileColumns = [
        {
            title: t("quest"),
            key: "title",
            dataIndex: "title",
            render: (title) => <p>{title}</p>,
        },
        {
            title: t("rate"),
            key: "to_review_count",
            dataIndex: "to_review_count",
        },
        Table.EXPAND_COLUMN,
    ];

    const columns = [
        {
            title: t("quest"),
            key: "title",
            dataIndex: "title",
            render: (title) => <p>{title}</p>,
        },
        {
            title: t("c-num"),
            key: "challenge_title",
            dataIndex: "challenge_title",
            render: (challenge_title, quest) => (
                <p
                    className="pointer"
                    onClick={() => window.open(`/quests/${quest.uuid}`, "_blank")}
                >
                    {challenge_title}
                </p>
            ),
        },
        {
            title: t("rate"),
            key: "to_review_count",
            dataIndex: "to_review_count",
        },
        {
            title: t("last-submit-time"),
            key: "last_sumbit_time",
            dataIndex: "last_sumbit_time",
            render: (time) =>
                time.indexOf("0001-01-01T") === -1 ? coverTimestamp(time) : "-",
        },
        {
            title: t("last-rate-time"),
            key: "last_review_time",
            dataIndex: "last_review_time",
            render: (time) =>
                time.indexOf("0001-01-01T") === -1 ? coverTimestamp(time) : "-",
        },
        {
            title: t("action"),
            key: "operate",
            dataIndex: "operate",
            render: (e, record) => (
                <div style={{ display: "flex" }}>
                    <Button
                        type="link"
                        style={{ color: "#8F5A35" }}
                        disabled={record.to_review_count === 0}
                        onClick={() => showModal(record, true)}
                    >
                        {t("grade")}
                    </Button>
                    <Button
                        type="link"
                        style={{ color: "#8F5A35" }}
                        disabled={record.reviewed_count === 0}
                        onClick={() => showModal(record)}
                    >
                        {t("graded")}
                    </Button>
                </div>
            ),
        },
    ];

    function showModal({ token_id, index }, isScore) {
        modalInfo = {
            token_id,
            index,
            open_quest_review_status: isScore ? 1 : 2,
        };
        setModalInfo({ ...modalInfo });
    }

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
        setModalInfo(null);
        getList();
    }

    // 修改状态过滤
    const handleChange = (pagination, filters, sorter) => {
        const { pageSize } = pagination;
        if (pageSize !== pageConfig.pageSize) {
            pageConfig.pageSize = pageSize;
            setPageConfig({ ...pageConfig });
            getList();
        }
    };

    const getList = async (page) => {
        setTableLoad(true);
        if (page) {
            pageConfig.page = page;
            setPageConfig({ ...pageConfig });
        }
        await getUserOpenQuestList(pageConfig).then((res) => {
            const list = res.data.list;
            data = list ? list : [];
            // 添加key
            data.forEach((ele, index) => {
                ele.key = ele.uuid + ele.index + index;
            });
            setData([...data]);
            pageConfig.total = res.data.total;
            if (status === 1) {
                rateNum = res.data.total_to_review;
                setRateNum(rateNum);
            }
            setPageConfig({ ...pageConfig });
        });
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
        const { flag, remain } = judgRef.current.isOver();
        if (flag) {
            submitReview();
        } else {
            confirm({
                title: "",
                className: "confirm-modal",
                icon: <></>,
                content: (
                    <>
                        <CloseOutlined
                            style={{ position: "absolute", right: 20, top: 20 }}
                        />
                        {t("confirm.submit", { num: remain })}
                    </>
                ),
                okText: t("submit"),
                cancelText: t("cancel"),
                onOk() {
                    submitReview();
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
        <div className="rating">
            {/* rateModal */}
            <Modal
                width={1177}
                maskClosable={false}
                className={`judg-modal ${isMobile ? "mobile-judg-modal" : ""}`}
                open={modalInfo?.open_quest_review_status === 1}
                onOk={handleOk}
                onCancel={() => {
                    setModalInfo(null);
                    judgRef.current.clearList();
                }}
                okText={t("submit")}
                cancelButtonProps={{
                    style: {
                        display: "none",
                    },
                }}
                okButtonProps={{
                    loading: isLoading,
                }}
            >
                <RatingModal
                    ref={judgRef}
                    onFinish={onFinish}
                    status={status}
                    pageNum={pageConfig.page}
                    data={modalInfo}
                    isMobile={isMobile}
                />
            </Modal>

            {/* detailModal */}
            <Modal
                width={1177}
                className={`judg-modal ${isMobile ? "mobile-judg-modal" : ""}`}
                open={modalInfo?.open_quest_review_status === 2}
                // footer={null}
                footer={<></>}
                onCancel={() => {
                    setModalInfo(null);
                    reviewRef.current.clearList();
                }}
            >
                <RatingModal ref={reviewRef} data={modalInfo} isMobile={isMobile} />
            </Modal>

            <div className="custom-bg-round"></div>
            <h2>
                {t("h1")}&nbsp;&nbsp;
                <span>
                    ({t("rate")} {rateNum})
                </span>
            </h2>
            <Table
                columns={isMobile ? mobileColumns : columns}
                // columns={columns}
                dataSource={data}
                rootClassName="custom-tabel"
                scroll={{ y: isMobile ? null : "calc(100vh - 414px)" }}
                onChange={handleChange}
                loading={tableLoad}
                locale={{
                    filterReset: null,
                    filterConfirm: t("ok"),
                }}
                expandable={
                    isMobile && {
                        expandedRowRender: (record) => (
                            <div className="more-items">
                                <div
                                    className="item"
                                    onClick={() =>
                                        window.open(
                                            `/quests/${record.token_id}`,
                                            "_blank"
                                        )
                                    }
                                >
                                    <p className="label">{t("c-num")}</p>
                                    <p className="value">
                                        {record.uuid.slice(0, 5)}...
                                        {record.uuid.slice(
                                            record.uuid.length - 5,
                                            record.uuid.length
                                        )}
                                    </p>
                                </div>
                                <div
                                    className="item"
                                    onClick={() =>
                                        window.open(
                                            `/${record.address}`,
                                            "_blank"
                                        )
                                    }
                                >
                                    <p className="label">{t("last-submit-time")}</p>
                                    <p className="value">
                                        {record.last_sumbit_time.indexOf(
                                            "0001-01-01T"
                                        ) === -1
                                            ? coverTimestamp(
                                                  record.last_sumbit_time
                                              )
                                            : "-"}
                                    </p>
                                </div>
                                <div className="item">
                                    <p className="label">{t("last-rate-time")}</p>
                                    <p className="value">
                                        {record.last_review_time.indexOf(
                                            "0001-01-01T"
                                        ) === -1
                                            ? coverTimestamp(
                                                  record.last_review_time
                                              )
                                            : "-"}
                                    </p>
                                </div>
                                <div className="item">
                                    <p className="label">{t("action")}</p>
                                    {/* <p className="value">
                                        {record.open_quest_review_time}
                                    </p> */}
                                    <div style={{ display: "flex" }}>
                                        <Button
                                            type="link"
                                            style={{ color: "#8F5A35" }}
                                            disabled={
                                                record.to_review_count === 0
                                            }
                                            onClick={() =>
                                                showModal(record, true)
                                            }
                                        >
                                            {t("grade")}
                                        </Button>
                                        <Button
                                            type="link"
                                            style={{ color: "#8F5A35" }}
                                            disabled={
                                                record.last_review_time.indexOf(
                                                    "0001-01-01T"
                                                ) !== -1
                                            }
                                            onClick={() => showModal(record)}
                                        >
                                            {t("graded")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ),
                        expandIcon: ({ expanded, onExpand, record }) => (
                            <div
                                className="btn-more"
                                onClick={(e) => onExpand(record, e)}
                            >
                                <DownOutlined
                                    className={expanded ? "active-icon" : ""}
                                />
                            </div>
                        ),
                        columnTitle: (
                            <p style={{ textAlign: "center" }}>{t("more")}</p>
                        ),
                        columnWidth: "auto",
                    }
                }
                pagination={{
                    className: "custom-pagination",
                    showSizeChanger: false,
                    position: isMobile ? ["bottomCenter"] : ["bottomRight"],
                    current: pageConfig.page,
                    total: pageConfig.total,
                    pageSize: pageConfig.pageSize,
                    onChange: (page) => {
                        page !== pageConfig.page && getList(page);
                    },
                }}
            />
        </div>
    );
}
