import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Viewer } from '@bytemd/react'
import { Divider, Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';

export default function CustomQuestion(props) {
    
    const { item, index, deleteQuestion, showEditModal } = props;
    const { t } = useTranslation(["publish", "translation"]);

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
                            {item.title}
                        </div>
                        <p>{t("inner.sc")}: {item.score}</p>
                    </div>
                </div>
                <div className="operation">
                    <div className="close" onClick={() => showEditModal(index - 1)}>
                        <EditOutlined />
                    </div>
                    <Popconfirm
                        title={t("translation:pop.delete.title")}
                        description={t("translation:pop.delete.desc")}
                        okText={t("translation:pop.yes")}
                        cancelText={t("translation:pop.no")}
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