import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    UnorderedListOutlined
  } from '@ant-design/icons';
import { Button } from 'antd';
import "@/assets/styles/component-style/index"
import { useTranslation } from 'react-i18next';
import MyContext from '@/provider/context';
import { useContext } from 'react';

export default function CustomPagination(props) {

    const { page, total, onChange, submit, openAnswers, type, isPreview } = props;

    const { t } = useTranslation(["translation", "explore"]);
    const { isMobile } = useContext(MyContext);
    
    return (
        <div className="CustomPagination">
            <div className="content-left">
                {
                    isMobile ?
                    <UnorderedListOutlined onClick={openAnswers} />
                    :
                    <Button type='link' onClick={openAnswers} style={{display: !isPreview ? "block" : "none"}}>
                        {t("explore:modal.challenge.title")}
                    </Button>
                }
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
                <Button className='submit' onClick={submit} style={{display: !isPreview ? "block" : "none"}}>
                    {t("btn-submit")}
                </Button>
            </div>
        </div>
    )
}