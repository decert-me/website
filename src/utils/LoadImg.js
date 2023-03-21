export function loadImg() {

    const gateways = JSON.parse(process.env.REACT_APP_IPFS_GATEWAYS);
    const imgUrl = process.env.REACT_APP_IPFS_TEPL;
    const requests = gateways.map((gateway) => fetch(`https://${gateway}/ipfs/${imgUrl}`));
  
    return Promise.race(requests.map((request) =>
      request.catch(() => Promise.resolve())
    )).then((response) => {
      if (response) {
        const gateway = response.url.slice(0, -imgUrl.length);
        console.log(`Using gateway: ${gateway}`);
        return gateway;
      } else {
        throw new Error('All gateways failed.');
      }
    });
  }