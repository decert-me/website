import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
  } from '@ant-design/icons';
import { Button } from 'antd';
import "@/assets/styles/component-style/index"

export default function CustomPagination(props) {

    const { page, total, onChange, sumbit } = props;
    
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
                page === total ?
                <Button className='submit' onClick={sumbit}>
                    提交
                </Button>
                :
                <Button 
                    className='btn'
                    icon={<ArrowRightOutlined />} 
                    onClick={() => onChange('add')}
                />
            }
        </div>
    )
}