export function findFastestGateway() {

    const gateways = JSON.parse(process.env.REACT_APP_IPFS_GATEWAYS);
    const imgUrl = process.env.REACT_APP_IPFS_TEPL;
    const timeout = 1000; // 设置超时时间为1秒

    return Promise.all(gateways.map(async function(gateway) {
      try {
        var startTime = Date.now();
        
        // 创建一个超时Promise
        var timeoutPromise = new Promise(function(resolve, reject) {
          setTimeout(function() {
            reject(new Error('Request timed out'));
          }, timeout);
        });
        
        // 使用Promise.race等待最先解决的Promise
        var response = await Promise.race([
          fetch(`https://${gateway}/ipfs/${imgUrl}`),
          timeoutPromise
        ]);
        
        var endTime = Date.now();
        var responseTime = endTime - startTime;
        
        if (response.ok) {
          return { gateway: gateway, responseTime: responseTime };
        }
      } catch (e) {
        // 如果发生错误，返回null
      }
      
      return null;
    })).then(function(results) {
      // 过滤掉响应失败的结果
      results = results.filter(function(result) {
        return result !== null;
      });
      
      // 找到响应时间最短的结果
      var fastest = null;
      var fastestTime = Infinity;
      
      results.forEach(function(result) {
        if (result.responseTime < fastestTime) {
          fastest = result.gateway;
          fastestTime = result.responseTime;
        }
      });
      
      return `https://${fastest}/ipfs/`;
    });
  }