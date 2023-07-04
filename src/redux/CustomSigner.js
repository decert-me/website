import { GetSign } from '@/utils/GetSign';
import { Modal } from 'antd';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect, useSigner } from 'wagmi';
const { confirm } = Modal;

function CustomSigner(props) {

    const { data: signer } = useSigner();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const navigateTo = useNavigate();
    const location = useLocation();

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
      if (!address) {
        return
      }
        openModal()
        await GetSign({address: address, signer: signer, disconnect: disconnect})
        .then(() => {
            if (localStorage.getItem('decert.token')) {
                Modal.destroyAll();
                props.hide();
                if (location.pathname.indexOf("/claim") === -1) {
                  navigateTo(0)
                }
            }
        })
        .catch(err => {
            Modal.destroyAll()
            props.hide()
        })
    }

    useEffect(() => {
      props?.isShow && signer && goSigner()
    },[props, signer])

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