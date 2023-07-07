import {
    CloseOutlined
  } from '@ant-design/icons';
import { Button } from 'antd';

export function modalNotice({text, t, onOk, icon}) {

    return {
        className: "modal-tip",
        icon: <></>,
        title: '',
        content: (
            <>
                <div className="custom-icon">
                    {icon}
                </div>
                <p className="tip-content">{text}</p>
                <Button type="text" className='modal-close' onClick={() => onOk()}><CloseOutlined /></Button>
            </>
        ),
        onOk: onOk,
        okText: t("translation:btn-confirm"),
        width: 364
    }
}