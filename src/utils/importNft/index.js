

function metaMaskImport({type, address, tokenId}) {
    window.ethereum.request({
    method: 'wallet_watchAsset',
    params: {
        type, options: { address, tokenId }
    }})
    .then((success) => {
        if (success) {
            console.log('NFT successfully added to wallet!');
        } else {
            throw new Error('Something went wrong.');
        }
    })
    .catch(err => {
        console.log(err);
    });
}

function trustImport({address, tokenId}) {
    const url = `trust://browser_enable_asset?asset=${address}&id=${tokenId}`;
    window.open(url, "_blank");
}

function tahoImport({type, address, tokenId}) {
    
}

export function importNft(props) {
    if (window.ethereum?.isMetaMask) {
        metaMaskImport(props);
    }else if (window.ethereum?.isTrust){
        // trustImport(props);
    }else if (window.ethereum?.isTaho) {
        // tahoImport(props);
    }
    // console.log(window.ethereum);
    // console.log(window.ethereum.currentProvider);
}