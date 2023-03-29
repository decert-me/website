import { CloseOutlined } from '@ant-design/icons';
import { Viewer } from '@bytemd/react'
import { Divider, Popconfirm } from 'antd';

export default function CustomQuestion(props) {
    
    const { item, index, deleteQuestion, label } = props;

    const deleteQuest = () => {
        deleteQuestion(index - 1)
    }

    return (
        <>        
            <div className="CustomQuestion">
                <div className="info">
                    <p className="title">{index}.</p>
                    <div className="content">
                        <div className="question-title">
                        <Viewer value={item.title} />
                        </div>
                        <p>{label}: {item.score}</p>
                    </div>
                </div>
                <div className="operation">
                    {/* <div className="edit" onClick={() => edit(index - 1)}>

                    </div> */}
                    <Popconfirm
                        title="Delete the task"
                        description="Are you sure to delete this task?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={deleteQuest}
                    >
                        <div className="close">
                            <CloseOutlined />
                        </div>
                    </Popconfirm>
                </div>
            </div>
            <Divider />
        </>
    )
}