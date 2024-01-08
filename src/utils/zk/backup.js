import { keys } from "@zcloak/did";
import { Keyring } from "@zcloak/keyring";


export const backup = async({mnemonic, pwd, nonce}) => {
    const keyring = new Keyring();
    const did = keys.fromMnemonic(keyring, mnemonic, "ecdsa");
    
    const keyFile = keys.backup(keyring, did, pwd)
    
    return {
        keys: {...keyFile},
        originPhase: nonce
    }
}