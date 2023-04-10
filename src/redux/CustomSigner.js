import { GetSign } from '@/utils/GetSign';
import { Modal } from 'antd';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { useAccount, useDisconnect, useSigner } from 'wagmi';
const { confirm } = Modal;

function CustomSigner(props) {

    const { data: signer } = useSigner();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

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

    async function goSigner() {
        openModal()
        await GetSign({address: address, signer: signer, disconnect: disconnect})
        .then(() => {
            if (localStorage.getItem('decert.token')) {
                Modal.destroyAll()
            }
        })
        .catch(err => {
            Modal.destroyAll()
        })
    }

    useEffect(() => {
        props?.isShow && goSigner()
    },[props])

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

export default CustomSigner;