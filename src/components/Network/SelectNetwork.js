import { CHAINS, CHAINS_DEV } from "@/config/chains";
import { Button, Dropdown } from "antd";
import { useNetwork, useSwitchNetwork } from "wagmi";
import CustomLoad from "../CustomLoad";
import "./index.scss";


export default function SelectNetwork(params) {

    const chains = process.env.REACT_APP_IS_DEV ? CHAINS_DEV : CHAINS;
    const { chain } = useNetwork();
    const { pendingChainId, switchNetworkAsync, isLoading } = useSwitchNetwork()


    const items = [{
        key: "1",
        type: 'group',
        label: "Select a Network",
        children: chains.map(item => {
            return {
                key: item?.id,
                label: (
                    <div className="network-item" onClick={() => changeNetwork(item?.id)}>
                        <div className="item-label">
                            <img src={item?.img} alt="" />
                            <p>{item?.name}</p>
                        </div>
                        {
                            isLoading && pendingChainId == item?.id ?
                            <CustomLoad ml="10px" fs="14px" />
                            :
                            <div className={`item-status ${chain.id === item?.id ? "item-status-active" : ""}`}></div>
                        }
                    </div>
                )
            }
        })
    }]

    async function changeNetwork(chainId) {
        try {
            await switchNetworkAsync(chainId);
        } catch (error) {
            console.log("switchChain Error: ", error);
        }
    }

    
    return(
        <Dropdown
            overlayClassName="dropdown-selectNetwork"
            placement="bottom"
            trigger="click"
            menu={{items}}
        >
            <Button
                type="ghost"
                ghost
                className='lang custom-btn'
                id='hover-btn-line'
            >
                <img src={chain?.img ? chain.img : require("@/assets/images/img/net-error.png")} alt="" />
            </Button>
        </Dropdown>
    )
}