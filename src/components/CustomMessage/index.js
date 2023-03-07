import { message } from "antd";


export const ClaimShareSuccess = () => (
    message.info({
        content: (
            <div>
                <h4>提交成功</h4>
                <p>
                    稍后系统将会把SBT发送至你的钱包账户，在此期间请勿删除此推文。
                </p>
            </div>
        ),
        duration: 3,
        icon: <></>,
        className: "message-share"
    })
)

export const ClaimShareError = () => (
    message.info({
        content: (
            <div>
                <h4>格式错误</h4>
                <p>
                    请勿删除或修改推文内容。
                </p>
            </div>
        ),
        duration: 3,
        icon: <></>,
        className: "message-share"
    })
)