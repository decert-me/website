import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    UnorderedListOutlined
  } from '@ant-design/icons';
import { Button } from 'antd';
import "@/assets/styles/component-style/index"
import { useTranslation } from 'react-i18next';

export default function CustomPagination(props) {

    const { page, total, onChange, submit, openAnswers, type, isPreview } = props;

    const { t } = useTranslation(["translation", "explore"]);
    
    return (
        <div className="CustomPagination">
            <div className="pagination-content">
                <div className="content-left" id='hover-text' onClick={openAnswers}>
                    <UnorderedListOutlined />
                    <Button type='link' style={{display: !isPreview ? "block" : "none"}}>
                        {t("explore:modal.challenge.title")}
                    </Button>
                </div>
                <div className="content-center">
                <Button
                    className='btn'
                        id='hover-btn-line-arrow'
                        icon={<ArrowLeftOutlined />} 
                    disabled={page === 1}
                    onClick={() => onChange('reduce')}
                />
                <p>
                    <span>{page}</span>
                    &nbsp;/&nbsp;
                    <span>{total}</span>
                </p>
                
                    <Button 
                        className='btn'
                        id='hover-btn-line-arrow'
                        disabled={page === total}
                        icon={<ArrowRightOutlined />} 
                        onClick={() => onChange('add')}
                    />
                </div>
                <div className="content-right">
                    <Button className='submit' id="hover-btn-full" onClick={submit} style={{display: !isPreview ? "block" : "none"}}>
                        {t("btn-submit")}
                    </Button>
                </div>
            </div>
        </div>
    )
}