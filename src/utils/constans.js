import { BigNumber } from "ethers";


export const constans = () => {

    const maxUint32 = Math.pow(2,32) - 1;
    const maxUint192 = BigNumber.from('2').pow(192).sub(1);

    return {
        maxUint32,
        maxUint192
    }
}