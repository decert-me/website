import { keys } from "@zcloak/did";
import { Keyring } from "@zcloak/keyring";
import { initCrypto, mnemonicGenerate } from "@zcloak/crypto";
import { getDidSignMessage } from "@/request/api/zk";
import { registerDidDoc } from "./didHelper";

export const createDID = async() => {
    await initCrypto();
    const mnemonic = mnemonicGenerate(12);
    const keyring = new Keyring();
    const did = keys.fromMnemonic(keyring, mnemonic, "ecdsa");
    const doc = await did.getPublish();
    await registerDidDoc(doc);

    // 获取签名信息
    const {data} = await getDidSignMessage({did: did.id})

    return {
        message: data?.loginMessage,        //  签名信息
        nonce: data?.nonce,
        did: did.id,
        mnemonic
    }
}

