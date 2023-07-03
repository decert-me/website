import {
    CloseOutlined
  } from '@ant-design/icons';
import { Button } from 'antd';

export function modalNotice({t, onOk}) {

    return {
        className: "modal-tip",
        icon: <></>,
        title: '',
        content: (
            <>
                {t("translation:message.error.challenge-modify")}
                <Button type="text" className='modal-close' onClick={() => onOk()}><CloseOutlined /></Button>
            </>
        ),
        onOk: onOk,
        okText: t("translation:btn-confirm"),
        width: 520
    }
}