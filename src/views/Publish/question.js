import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, Empty } from "antd";
import { ConfirmClearQuest } from "@/components/CustomConfirm/ConfirmClearQuest";
import { CustomQuestion } from "@/components/CustomItem";
import ModalAddQuestion from "@/components/CustomModal/ModalAddQuestion";
import ModalAddCodeQuestion from "@/components/CustomModal/ModalAddCodeQuestion";
import { importFile } from "@/utils/importFile";
import ModalAddOpenQuestion from "@/components/CustomModal/ModalAddOpenQuestion";
import { useAddress } from "@/hooks/useAddress";
import { changeConnect } from "@/utils/redux";
import { useUpdateEffect } from "ahooks";
import { hasCreateOpenQuestPerm } from "@/request/api/public";



export default function PublishQuestion({
    questions, 
    questionEdit,
    questionChange, 
    questionImport,
    deleteQuestion,
    clearQuest,
}) {
    
    const { t } = useTranslation(["publish", "translation"]);
    const { isConnected } = useAddress();
    let [isBeta, setIsBeta] = useState();
    let [showAddQs, setShowAddQs] = useState(false);        //  添加普通题
    let [showAddCodeQs, setShowAddCodeQs] = useState(false);    //  添加编程题
    let [showAddOpenQs, setShowAddOpenQs] = useState(false);    //  添加编程题

    let [selectQs, setSelectQs] = useState();       //  修改题目内容
    let [selectIndex, setSelectIndex] = useState();     //  修改题目索引

    async function importChallenge(event) {
        const res = await importFile(event);
        questionImport(res);
    }

    function showEditModal(index) {
        const obj = questions[index];
        if (obj.type === "coding" || obj.type === "special_judge_coding") {
            // 编程题
            setShowAddCodeQs(true);
        }else if (obj.type === "open_quest") {
            // 开放题
            setShowAddOpenQs(true);
        }else {
            // 普通题
            setShowAddQs(true);
        }
        selectQs = obj;
        setSelectQs({...selectQs});
        setSelectIndex(index);
    }

    function clearSelect() {
        setSelectQs(null);
        setSelectIndex(null);
    }

    function getOpenQus() {
        hasCreateOpenQuestPerm()
        .then(res => {

            isBeta = res.data;
            setIsBeta(isBeta);
        })
    }

    useUpdateEffect(() => {
        // 内侧 && 获取当前账户是否可创建开放题
        getOpenQus()
    },[isConnected])

    return (
        <>
            {/* 添加普通题弹窗 */}
            {
                showAddQs &&
                <ModalAddQuestion
                    isModalOpen={showAddQs} 
                    handleCancel={() => {setShowAddQs(false)}}
                    questionChange={questionChange}
                    // 编辑部分
                    selectQs={selectQs}
                    questionEdit={(quest) => questionEdit(quest, selectIndex)}
                />
            }
            {/* 添加代码题弹窗 */}
            {
                showAddCodeQs &&
                <ModalAddCodeQuestion
                    isModalOpen={showAddCodeQs} 
                    handleCancel={() => {setShowAddCodeQs(false)}}
                    questionChange={questionChange}
                    编辑部分
                    selectQs={selectQs}
                    questionEdit={(quest) => questionEdit(quest, selectIndex)}
                />
            }
            {/* 添加开放题弹窗 */}
            {
                showAddOpenQs &&
                <ModalAddOpenQuestion
                    isModalOpen={showAddOpenQs} 
                    handleCancel={() => {setShowAddOpenQs(false)}}
                    questionChange={questionChange}
                    // 编辑部分
                    selectQs={selectQs}
                    questionEdit={(quest) => questionEdit(quest, selectIndex)}
                />
            }
            
            {/* 普通题 */}
            <div className="questions">
                <div className="quest-head" style={{
                    justifyContent: "flex-end"
                }}>
                    {
                        questions.length !== 0 &&
                        <Button
                            type="link" 
                            onClick={() => ConfirmClearQuest(clearQuest)}
                        >
                            {t("inner.clear")} 
                        </Button>
                    }
                </div>
                {
                    questions.length !== 0 ?
                    <Divider />:
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("inner.nodata")} />
                }
                {
                    questions.map((e,i) => 
                        <CustomQuestion
                            key={i} 
                            item={e} 
                            index={i+1} 
                            deleteQuestion={deleteQuestion}
                            showEditModal={showEditModal} 
                        />
                    )
                }
            </div>
        
            {/* 添加题目 */}
            <div className="add-btns">
                {/* 添加普通题 */}
                <Button
                    type="link" 
                    onClick={() => {
                        clearSelect();
                        setShowAddQs(true);
                    }}
                >
                    {t("inner.add")}
                </Button>

{/* TODO: 登陆后没权限 ===>  隐藏 */}
                {/* 添加开放题 */}
                {
                    isBeta && ((isBeta.beta && isBeta.perm) || (!isBeta)) &&

                    <Button
                        type="link" 
                        onClick={() => {
                            if (!isConnected) {
                                changeConnect();
                                return
                            }
                            clearSelect();
                            setShowAddOpenQs(true);
                        }}
                    >
                        {t("inner.add-open")}
                    </Button>
                }
                
                {/* 添加编程题 */}
                <Button
                    type="link" 
                    onClick={() => {
                        clearSelect();
                        setShowAddCodeQs(true);
                    }}
                >
                    {t("inner.add-code")}
                </Button>

                {/* 导入题目 */}
                <input id="fileInput" type="file" accept=".md" onChange={importChallenge} style={{display: "none"}} />
                <Button size="small" onClick={() => {
                    document.getElementById("fileInput").click();
                }}>{t("upload")}</Button>
            </div>
            <Divider />
        </>
    )
}