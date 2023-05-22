import ModalConnect from '@/components/CustomModal/ModalConnect';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

function CustomConnect(props) {

    let [isConnect, setIsConnect] = useState(false);

    const hideModal = () => {
        setIsConnect(false);
    }

    useEffect(() => {
        props?.isConnect && setIsConnect(true)
    },[props])

    return (
        <ModalConnect isModalOpen={isConnect} handleCancel={hideModal} />
    );
}

function mapStateToProps(state) {
  return {
    isConnect: state.isConnect
  };
}

// function mapDispatchToProps(dispatch) {
//   return {
//     show: () => dispatch({ type: 'SHOW' }),
//     hide: () => dispatch({ type: 'HIDE' })
//   };
// }

export default connect(mapStateToProps)(CustomConnect);