import {
    LoadingOutlined,
} from '@ant-design/icons';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';


export default function CustomLoading(props) {

    const { className } = props;
    const { t } = useTranslation();

    return (
        <div className={`${className ? className : "loading"}`}>
            <Spin 
                indicator={
                    <LoadingOutlined
                        style={{
                        fontSize: 24,
                        }}
                        spin
                    />
                } 
            />
            <p>{t("status.load")}...</p>
        </div>
    )
}