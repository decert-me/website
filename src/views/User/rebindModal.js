import { Button, Modal } from "antd";


export function RebindModal({confirmBind}) {
    
    return (
        <div className="rebind-modal">
            <p className="title">提示：</p>
            <p className="text">这个 github账号 已经绑定到另一个用户 A 了!</p>
            <p className="text">是否解绑并绑定当前账户 B</p>
            <div className="btns">
                <Button type="primary" color="#E2E2E2" onClick={() => Modal.destroyAll()}>取消</Button>
                <Button type="primary" onClick={confirmBind}>确定换绑</Button>
            </div>
        </div>
    )
}