import { CloseOutlined } from '@ant-design/icons';
import { Viewer } from '@bytemd/react'
import { Divider } from 'antd';

export default function CustomQuestion(props) {
    
    const { item, index, deleteQuestion } = props;

    return (
        <>        
            <div className="CustomQuestion">
                <p className="title">{index}.</p>
                <div className="content">
                    <div className="question-title">
                    <Viewer value={item.title} />
                    </div>
                    <p>Question Score: {item.score}</p>
                </div>
                <div className="close" onClick={() => deleteQuestion(index - 1)} >
                    <CloseOutlined />
                </div>
            </div>
            <Divider />
        </>
    )
}