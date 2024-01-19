import { challengeJson, nftJson } from "@/request/api/public";
import { generateUUID } from "./getUuid";
import { constans } from "./constans";
import axios from "axios";

export async function getMetadata({values, address, questions, answers, image, media, startTime, olduuid}, preview) {
    /**
     * let obj = {
            title: values.title,
            description: values.desc,
            image: "ipfs://"+values.fileList?.file.response.hash,
            properties: {
                questions: qs,
                answers: encode(process.env.REACT_APP_ANSWERS_KEY, JSON.stringify(answers)),
                passingScore: values.score,
                startTime: new Date().toISOString(),
                endTIme: null,
                url: "",
                requires: [],
                difficulty: values.difficulty !== undefined ? values.difficulty : null,
                estimateTime: values.time ? values.time : null
            },
            version: 1
        }
     *  */    

    const version = 1.2;
    const obj = {
        title: values.title,
        description: values.desc,
        creator: address, 
        content: "",
        questions: questions, 
        answers: answers, 
        startTime: startTime || new Date().toISOString(), 
        endTIme: null, 
        estimateTime: values.time ? values.time : null,
        passingScore: values.score, 
        version: version 
    }
    const questHash = preview ? obj : await challengeJson(obj);
    const uuid = generateUUID();
    const nft = {
        name: values.title,
        description: values.desc,
        image: image,
        attributes: {
            challenge_ipfs_url: preview ? questHash : "ipfs://" + questHash.data.hash,
            challenge_url: `https://decert.me/quests/${olduuid || uuid}`,
            challenge_title: values.title,
            challenge_type: "challenge",
            creator: address,
            difficulty: values.difficulty !== undefined ? values.difficulty : null,
        },
        properties: {
            media
        },
        external_url: "https://decert.me",
        version: version
    }
    const nftHash = preview ? nft : await nftJson(nft);

    return preview ? nftHash : nftHash.data
}

export async function getCollectionMetadata({values, challenges, address}) {
    
    const isDev = process.env.REACT_APP_IS_DEV;

    const version = 1.2;
    const uuid = generateUUID();
    const nft = {
        name: values.title,
        description: values.desc,
        image: values.image,
        attributes: {
            challenge_url: isDev ? `http://192.168.1.10:8087/collection/${uuid}` : `https://decert.me/collection/${uuid}`,
            challenge_title: values.title,
            challenge_type: "collection",
            challenges: challenges,
            creator: address,
            difficulty: values?.difficulty || null,
        },
        external_url: isDev ? "http://192.168.1.10:8087" : "https://decert.me",
        version: version
    }
    const nftHash = await nftJson(nft, "collection");

    return nftHash.data
}

export async function setMetadata(props) {
    const metadata = props;
    const { ipfsPath } = constans();
    const params = props?.metadata ? props.metadata : props;
    if (params.version === 1) {
        return metadata
    }
    // switch (params.version) {
    //     case 1:
            
    //         break;
    //     case 1.1:
    //     case 1.2:
    //         await v1_1()
    //         break;
    //     default:
    //         break;
    // }
        let challenge;
        if (props.quest_data) {
            challenge = props.quest_data;
        }else{
            const res = await axios.get(`${ipfsPath}/${params.attributes.challenge_ipfs_url.replace("ipfs://", '')}`);
            challenge = res.data;
        }
        let obj = {
            title: challenge.title,
            description: challenge.description,
            image: params.image,
            creator: challenge.creator,
            properties: {
                questions: challenge.questions,
                // default_questions: defaultQuest || [],
                answers: challenge.answers,
                passingScore: challenge.passingScore,
                startTime: challenge.startTime,
                endTIme: challenge.endTIme,
                estimateTime: challenge.estimateTime,
                url: "",
                requires: [],
                difficulty: params.attributes.difficulty,
            },
        }
        if (props?.metadata) {
            const res = JSON.parse(JSON.stringify(metadata));
            res.metadata = obj;
            return res
        }else{
            metadata = obj;
            return obj;
        }
}