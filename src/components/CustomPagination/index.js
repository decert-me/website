import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
  } from '@ant-design/icons';
import { Button } from 'antd';
import "@/assets/styles/component-style/index"
import { useTranslation } from 'react-i18next';

export default function CustomPagination(props) {

    const { page, total, onChange, submit, openAnswers, type } = props;

    const { t } = useTranslation(["translation"]);
    
    return (
        <div className="CustomPagination">
            <div className="content-left">
                <Button type='link' onClick={openAnswers}>
                    答题记录
                </Button>
            </div>
            <div className="content-center">
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
                <Button 
                    className='btn'
                    disabled={page === total}
                    icon={<ArrowRightOutlined />} 
                    onClick={() => onChange('add')}
                />
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
            <div className="content-right">
                <Button className='submit' onClick={submit}>
                    {t("btn-submit")}
                </Button>
            </div>
        </div>
    )
}