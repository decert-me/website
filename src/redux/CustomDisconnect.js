import { useEffect } from 'react';
import { connect } from 'react-redux';
import { useDisconnect } from 'wagmi';
import { useWallet } from "@solana/wallet-adapter-react";
import { useAddress } from '@/hooks/useAddress';
import { ClearStorage } from '@/utils/ClearStorage';

function CustomDisconnect(props) {

    const { wallet } = useWallet();
    const { walletType, isConnected } = useAddress();
    const { disconnect } = useDisconnect();


    function goDisconnect() {
        props.setDisConnect(false);
        if (walletType === "evm") {
            disconnect();
            ClearStorage();
        }else{
            wallet.adapter.disconnect()
            .then(res => {
                ClearStorage();
            })
        }
    }

    useEffect(() => {
      props?.isDisconnect && isConnected && goDisconnect()
    },[props, isConnected])

  return (
    <></>
  );
}

function mapStateToProps(state) {
  return {
    isDisconnect: state.isDisconnect
  };
}

function mapDispatchToProps(dispatch) {
    return {
      setDisConnect: (isDisconnect) => dispatch({ type: 'SET_DISCONNECT', payload: isDisconnect}),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomDisconnect);