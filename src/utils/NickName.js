
export function NickName(address) {
    if (address) {
        let str = "";

        switch (address.length) {
            // DID
            case 49:
                str = address.slice(0,11) + "..." + address.slice(-4);
                break;
            // EVM
            case 42:
                str = address.slice(0, 5) + "..." + address.slice(-4);
                break;
            // SOLANA
            case 44:
                str = address.slice(0, 4) + "..." + address.slice(-4);
                break;
            default:
                break;
        }
        return str;
    }
}