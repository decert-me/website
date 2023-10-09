
export function NickName(address) {
    if (address) {
        return address.length === 42 ? address.slice(0, 5) + "..." + address.slice(-4) : address.slice(0,4) + "..." + address.slice(-4);
    }
}