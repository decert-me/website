import { hashAvatar } from "./HashAvatar";
import { constans } from "./constans";


export function avatar(props) {

    const { imgPath } = constans();
    const { address, avatar } = props;
    if (avatar) {
        return imgPath + avatar
    }else {
        return hashAvatar(address)
    }
}

export function nickname(props) {
    const { address, nickname } = props;
    if (nickname) {
        return nickname;
    }else{
        return address.substring(0,5) + "..." + address.substring(38,42);
    }
}