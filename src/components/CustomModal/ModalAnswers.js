import {
    CloseSquareOutlined
} from '@ant-design/icons';
import { Button, Modal } from "antd";
import "@/assets/styles/component-style"
import { useTranslation } from 'react-i18next';
import MyContext from '@/provider/context';
import { useContext, useEffect, useState } from 'react';
import { Encryption } from '@/utils/Encryption';
import { useRequest, useUpdateEffect } from 'ahooks';


export default function ModalAnswers(props) {
    
    const { isModalOpen, handleCancel, submit, answers, changePage, detail } = props;
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
            if (e === null || e === undefined || e === "") {
                statusAnswer[i] = "none"
            }else{
                if (realAnswer[i] === null) {
                    // 编程题, [id, 正确与否]
                    statusAnswer[i] = e.correct ? "success" : "error";
                    return
                }else if (typeof realAnswer[i] === "object") {
                    // 多选
                    if (e.length !== realAnswer[i].length) {
                        statusAnswer[i] = "error";
                        return
                    }
                    let flag = true;
                    realAnswer[i].map((ele,index) => {
                        if (ele !== e[index]) {
                            flag = false;
                        }
                    })
                    statusAnswer[i] = flag ? "success" : "error";
                }else{
                    // 单选
                    statusAnswer[i] = e === realAnswer[i] ? "success" : "error"
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
            width={842}
            centered
            maskClosable={false}
            destroyOnClose={true}
            closeIcon={<CloseSquareOutlined style={{fontSize: "33px", color: "#000"}} />}
        >
            <h5>{t("modal.challenge.title")}</h5>
            <ul className="tips">
                <li className='fc-success'><div className="point success" />{t("publish:inner.true")}</li>
                <li className='fc-normal'><div className="point normal" />{t("modal.challenge.uncomplete")}</li>
                <li className='fc-error'><div className="point error" />{t("publish:inner.false")}</li>
            </ul>
            
            <ul className="answers custom-scroll">
                {
                    answers.map((e,i) => 
                        <li 
                            key={i} 
                            className={`point ${statusAnswer[i] === "success" ? "success" : statusAnswer[i] === "none" ? "normal" : "error" }`}
                            onClick={() => checkPage(i)}
                        >{i+1}</li>
                    )
                }
            </ul>

            <Button className='submit' onClick={checkSubmit}>{t("translation:btn-sumbit-confirm")}</Button>
        </Modal>
    )
}