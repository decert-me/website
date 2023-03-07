import { message } from "antd";


export const ClaimShare = () => (
    message.info({
        content: (
            <div>
                <h4>提交成功</h4>
                <p>
                    稍后系统将会把SBT发送至你的钱包账户，在此期间请勿删除此推文。
                </p>
            </div>
        ),
        duration: 30,
        icon: <></>,
        className: "message-share"
    })
)