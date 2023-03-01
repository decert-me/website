import {
    CloseSquareOutlined
} from '@ant-design/icons';
import { Button, Modal } from "antd";
import "@/assets/styles/component-style"


export default function ModalAnswers(props) {
    
    const { isModalOpen, handleCancel, submit, answers, changePage } = props;

    const checkPage = (i) => {
        handleCancel()
        changePage(i+1)
    }

    const checkSubmit = () => {
        Modal.destroyAll();
        submit();
    }

    return (
        <Modal
            className="ModalAnswers" 
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={842}
            centered
            maskClosable={false}
            destroyOnClose={true}
            closeIcon={<CloseSquareOutlined style={{fontSize: "33px", color: "#000"}} />}
        >
            <h5>ANSWER SHEETS</h5>
            <ul className="tips">
                <li><div className="point success" />completed</li>
                <li><div className="point normal" />unfinished</li>
            </ul>
            
            <ul className="answers">
                {
                    answers.map((e,i) => 
                        <li 
                            key={i} 
                            className={`point ${e || e === 0 ? "success":"normal"}`}
                            onClick={() => checkPage(i)}
                        >{i+1}</li>
                    )
                }
            </ul>

            <Button className='submit' onClick={checkSubmit}>Check and submit</Button>
            
        </Modal>
    )
}