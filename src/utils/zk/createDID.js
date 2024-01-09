import { keys } from "@zcloak/did";
import { Keyring } from "@zcloak/keyring";
import { initCrypto, mnemonicGenerate } from "@zcloak/crypto";
import { generateUUID } from "../getUuid";

export const createDID = async() => {
    await initCrypto();
    const mnemonic = mnemonicGenerate(12);
    const keyring = new Keyring();
    const did = keys.fromMnemonic(keyring, mnemonic, "ecdsa");

    // 获取签名信息
    const nonce = generateUUID();
    const loginMsg = 
`zkID: Enable W3C DID
${did.id}

More information: https://github.com/zCloak-Network/zk-did-method-specs

Nonce:
${nonce}`

    return {
        message: loginMsg,        //  签名信息
        nonce: nonce,
        did: did.id,
        mnemonic
    }
}

