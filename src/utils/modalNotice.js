import {
    CloseOutlined
  } from '@ant-design/icons';
import { Button } from 'antd';

export function modalNotice({text, t, onOk}) {

    return {
        className: "modal-tip",
        icon: <></>,
        title: '',
        content: (
            <>
                {text}
                <Button type="text" className='modal-close' onClick={() => onOk()}><CloseOutlined /></Button>
            </>
        ),
        onOk: onOk,
        okText: t("translation:btn-confirm"),
        width: 520
    }
}