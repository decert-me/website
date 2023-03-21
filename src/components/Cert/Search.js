import { useVerifyAccount } from "@/hooks/useVerifyAccount";
import {
    SearchOutlined
} from "@ant-design/icons"
import { Input } from "antd";

export default function CertSearch(props) {

    const { verify: run, isLoading } = useVerifyAccount({address: ''});

    return (
        <div className="search">
            <p className="search-title">
                搜索
            </p>
            <div className="search-inner">
                <SearchOutlined className="icon" />
                <Input bordered={false} />
            </div>
        </div>
    )
}