import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuests, shareClick } from "../../request/api/public";
import { Modal } from 'antd';
import "@/assets/styles/view-style/question.scss"
import "@/assets/styles/mobile/view-style/question.scss"
import { setMetadata } from "@/utils/getMetadata";
import { useAddress } from "@/hooks/useAddress";
import MyContext from "@/provider/context";
import Content from "./Content";


export default function Quests(params) {



    const location = useLocation();
    const navigateTo = useNavigate();
    const { isConnected, address: userAddress } = useAddress();
    const { isMobile, connectWallet, connectMobile } = useContext(MyContext);
    let [detail, setDetail] = useState();
    const { questId } = useParams();

    // 地址验证相关状态
    const [showAddressMismatchModal, setShowAddressMismatchModal] = useState(false);
    const [showNotLoggedInModal, setShowNotLoggedInModal] = useState(false);
    const [hasCheckedAddress, setHasCheckedAddress] = useState(false);
    const [lastCheckedAddress, setLastCheckedAddress] = useState(null); // 记录上次检查的地址
    const [walletInitialized, setWalletInitialized] = useState(false); // 钱包状态是否已初始化

    // 处理未登录弹窗关闭，自动连接钱包
    const handleNotLoggedInModalClose = () => {
        setShowNotLoggedInModal(false);
        if (isMobile) {
            connectMobile();
        } else {
            connectWallet();
        }
    };

    const getData = async (id) => {
        try {
            const res = await getQuests({id: id});
            setMetadata(res.data)
            .then(res => {
                detail = res ? res : {};
                setDetail({...detail});
            })
        } catch (error) {
            navigateTo("/404")
        }
    }

    useEffect(() => {
        questId && getData(questId);
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");
        code && shareClick({share_code: code})
    }, []);

    // 等待钱包状态初始化完成
    useEffect(() => {
        // 给钱包一些时间初始化（延迟500ms）
        const timer = setTimeout(() => {
            setWalletInitialized(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // 地址验证逻辑：检查 URL 中的 address 参数与用户登录地址是否一致
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const urlAddress = searchParams.get('address');

        if (!urlAddress) return;
        if (!walletInitialized) return; // 等待钱包初始化完成

        // 如果用户地址变化了，重置检查标记
        if (userAddress && userAddress !== lastCheckedAddress) {
            setHasCheckedAddress(false);
            setLastCheckedAddress(userAddress);
        }

        if (hasCheckedAddress) return;

        // 如果已登录，检查地址是否一致
        if (isConnected && userAddress) {
            if (urlAddress.toLowerCase() === userAddress.toLowerCase()) {
                // 地址一致，不显示任何弹窗
                setHasCheckedAddress(true);
            } else {
                // 地址不一致，显示提示
                setShowAddressMismatchModal(true);
                setHasCheckedAddress(true);
            }
            return;
        }

        // 如果有 address 参数但用户未登录，显示未登录提示
        if (!isConnected) {
            setShowNotLoggedInModal(true);
            setHasCheckedAddress(true);
        }
    }, [isConnected, userAddress, location.search, hasCheckedAddress, lastCheckedAddress, walletInitialized]);

    return (
        <>
            {detail && <Content detail={detail} questId={questId} />}

            {/* 未登录提示弹窗 */}
            <Modal
                title="请先登录"
                open={showNotLoggedInModal}
                onOk={handleNotLoggedInModalClose}
                onCancel={handleNotLoggedInModalClose}
                okText="连接钱包"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <p>请用您在登链社区网站绑定的钱包地址登录再开始挑战</p>
            </Modal>

            {/* 地址不一致提示弹窗 */}
            <Modal
                title="请更换地址"
                open={showAddressMismatchModal}
                onOk={() => setShowAddressMismatchModal(false)}
                onCancel={() => setShowAddressMismatchModal(false)}
                okText="我知道了"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <p>请更换 连接钱包 的地址为您在 登链社区网站 绑定的地址后再开始挑战！</p>
            </Modal>
        </>
    )
}