import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
  } from '@ant-design/icons';
import { Button } from 'antd';
import "@/assets/styles/component-style/index"
import { useTranslation } from 'react-i18next';

export default function CustomPagination(props) {

    const { page, total, onChange, sumbit, type } = props;
    const { t } = useTranslation(["translation"]);
    
    return (
        <div className="CustomPagination">
            <Button
                className='btn'
                icon={<ArrowLeftOutlined />} 
                disabled={page === 1}
                onClick={() => onChange('reduce')}
            />
            <p>
                <span>{page}</span>
                &nbsp;/&nbsp;
                <span>{total}</span>
            </p>
            {
                type === "write" &&
                (
                    page === total ?
                    <Button className='submit' onClick={sumbit}>
                        {t("btn-submit")}
                    </Button>
                    :
                    <Button 
                        className='btn'
                        icon={<ArrowRightOutlined />} 
                        onClick={() => onChange('add')}
                    />
                )
            }
            {
                type === "preview" && 
                (
                    page === total ?
                    ""
                    :
                    <Button 
                        className='btn'
                        icon={<ArrowRightOutlined />} 
                        onClick={() => onChange('add')}
                    />
                )
            }
        </div>
    )
}