import {
    CloseOutlined
} from '@ant-design/icons';
import { Button, Modal } from "antd";
import "@/assets/styles/component-style"
import { useTranslation } from 'react-i18next';
import MyContext from '@/provider/context';
import { useContext, useEffect, useState } from 'react';
import { Encryption } from '@/utils/Encryption';
import { useRequest, useUpdateEffect } from 'ahooks';


export default function ModalAnswers(props) {
    
    const { isModalOpen, handleCancel, submit, answers, changePage, detail, isPreview } = props;
    const { t } = useTranslation(["explore", "translation", "publish"]);
    const { isMobile } = useContext(MyContext);
    const { decode } = Encryption();
    const key = process.env.REACT_APP_ANSWERS_KEY;
    let [realAnswer, setRealAnswer] = useState([]);
    let [statusAnswer, setStatusAnswer] = useState([]);

    const checkPage = (i) => {
        handleCancel()
        changePage(i+1)
    }

    const checkSubmit = () => {
        Modal.destroyAll();
        submit();
    }

    function getResult(params) {
        // 答题记录 ===> 
        answers.map((e,i) => {
            if (e === null || e === undefined || (e.type!=="open_quest" && e?.value === "") || isPreview) {
                statusAnswer[i] = "unanswer"
            }else{
                if (realAnswer[i] === null) {
                    if (e.type === "open_quest") {
                        // 开放题
                        statusAnswer[i] = e.annex.length === 0 && !e.value ? "unanswer" : "answered"
                    }else{
                        // 编程题, [id, 正确与否]
                        statusAnswer[i] = e.correct ? "true" : "false";
                    }
                    return
                }else if (typeof realAnswer[i] === "object") {
                    // 多选
                    if (e.value?.length !== realAnswer[i].length) {
                        statusAnswer[i] = "false";
                        return
                    }
                    let flag = true;
                    realAnswer[i].map((ele,index) => {
                        if (ele !== e.value[index]) {
                            flag = false;
                        }
                    })
                    statusAnswer[i] = flag ? "true" : "false";
                }else{
                    // 单选
                    statusAnswer[i] = e.value === realAnswer[i] ? "true" : "false"
                }
            }
        })
        setStatusAnswer([...statusAnswer]);
    }

    const { runAsync } = useRequest(getResult, {
        debounceWait: 1000,
        manual: true
    });

    function init(params) {
        realAnswer = eval(decode(key, detail.metadata.properties.answers));
        setRealAnswer([...realAnswer]);
        // 初次进入计算
        getResult();
    }
    
    useUpdateEffect(() => {
        runAsync();
    },[answers])

    useEffect(() => {
        detail && init()
    },[])
    return (
        <Modal
            className={`ModalAnswers ${isMobile ? "ModalAnswers-mobile" : ""}`} 
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={987}
            centered
            maskClosable={false}
            destroyOnClose={true}
            closeIcon={<CloseOutlined style={{fontSize: "18px", color: "#000"}} />}
        >
            <h5>{t("modal.challenge.title")}</h5>
            <div className="tips">
                <div className="tip">
                    <div className="round true">
                        <div className="point"></div>
                    </div>{t("publish:inner.true")}
                </div>
                <div className="tip">
                    <div className="round false">
                        <div className="point"></div>
                    </div>{t("publish:inner.false")}
                </div>
                <div className="tip">
                    <div className="round answered">
                        <div className="point"></div>
                    </div>已答
                </div>
                <div className="tip">
                    <div className="round unanswer">
                        <div className="point"></div>
                    </div>未答
                </div>
            </div>
            <div className="box custom-scroll">
                <ul className="answers">
                    {
                        answers.map((e,i) => 
                            <li 
                                key={i} 
                                //  === "success" ? "success" : statusAnswer[i] === "none" ? "normal" : statusAnswer[i] === "error" ? "error" : "normal" 
                                className={`point ${statusAnswer[i]}`}
                                onClick={() => checkPage(i)}
                            >{i+1}</li>
                        )
                    }
                </ul>
            </div>

            <Button className='submit' onClick={checkSubmit}>{t("translation:btn-sumbit-confirm")}</Button>
        </Modal>
    )
}