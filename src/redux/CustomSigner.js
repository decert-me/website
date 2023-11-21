import { GetSign } from '@/utils/GetSign';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDisconnect, useWalletClient } from 'wagmi';
import { useWallet } from "@solana/wallet-adapter-react";
import { useAddress } from '@/hooks/useAddress';
import { useRequest } from 'ahooks';
import bs58 from 'bs58'

import { authLoginSign, getLoginMsg } from '@/request/api/public';
const { confirm } = Modal;

function openModal() {
  confirm({
      title: 'Please sign the message in your wallet.',
      className: "modalSigner",
      icon: <></>,
      maskStyle: {
          backgroundColor: "rgba(0, 0, 0, 0.9)"
      },
      content: null,
      footer: null
    });
}

function CustomSigner(props) {

    const { connected, wallet } = useWallet();
    const { address, walletType } = useAddress();
    const { disconnect } = useDisconnect();
    const navigateTo = useNavigate();
    const location = useLocation();
    const { data: walletClient } = useWalletClient();
    const { runAsync } = useRequest(goSigner, {
      debounceWait: 300,
      manual: true
    });
    let [message, setMessage] = useState();

    // 错误处理
    function isError(err) {
      console.log(err);
      Modal.destroyAll();
      props.hide();
    }

    function signSuccess(token) {
      localStorage.setItem(`decert.token`,token);
      setTimeout(() => {
        if (localStorage.getItem('decert.token')) {
          Modal.destroyAll();
          props.hide();
          if (location.pathname.indexOf("/claim") === -1) {
            navigateTo(0)
          }
        }
      }, 100);
    }

    function goSigner() {
      openModal();
      new Promise(async(resolve, reject) => {
        // 1. 获取nonce
        await getLoginMsg({address})
        .then(res => {
          if (res.status === 0) {
            message = res.data.loginMessage;
            setMessage(message);
          }
        })
        .catch(err => reject(err))

        // 2. 发起签名
        if (walletType === "evm") {
          walletClient.signMessage({message})
          .then(res => resolve(res))
          .catch(err => reject(err))
        }else{
          const msg = new TextEncoder().encode(message);
          message = msg;
          setMessage(message);
          wallet.adapter.signMessage({message: msg})
          .then(res => resolve(res))
          .catch(err => reject(err))
        }
      })
      .then(signature => {
        // solana签名得到的是arr需encode转换
        let newSign = signature;
        if (walletType === "solana") {
          newSign = bs58.encode(signature)
        }
        // 3. 获取token
        authLoginSign({ address, message, signature: newSign })
        .then(res => res && signSuccess(res.data.token))
        .catch(err => isError(err));
      })
      .catch(err => isError(err))      
    }

    useEffect(() => {
      props?.isShow && (walletClient || connected) && address && runAsync()
    },[props, walletClient, connected])

  return (
    <></>
  );
}

function mapStateToProps(state) {
  return {
    isShow: state.isShow
  };
}

function mapDispatchToProps(dispatch) {
  return {
    show: () => dispatch({ type: 'SHOW' }),
    hide: () => dispatch({ type: 'HIDE' })
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomSigner);