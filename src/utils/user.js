import { hashAvatar } from "./HashAvatar";


export function avatar(props) {
    const { address, avatar } = props;
    if (avatar) {
        return process.env.REACT_APP_BASE_URL + avatar
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