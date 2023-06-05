import { challengeJson, nftJson } from "@/request/api/public";
import { generateUUID } from "./getUuid";
import { constans } from "./constans";
import axios from "axios";

export async function getMetadata({values, address, questions, answers, image}, preview) {
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

    const version = 1.1;
    const obj = {
        title: values.title,
        description: values.desc,
        creator: address, 
        content: "",
        questions: questions, 
        answers: answers, 
        startTime: new Date().toISOString(), 
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
            challenge_url: `https://decert.me/quests/${uuid}`,
            challenge_title: values.title,
            creator: address,
            difficulty: values.difficulty !== undefined ? values.difficulty : null,
        },
        external_url: "https://decert.me",
        version: version
    }
    const nftHash = preview ? nft : await nftJson(nft);

    return preview ? nftHash : nftHash.data
}

export async function setMetadata(props) {
    let metadata = props;
    const { ipfsPath } = constans();
    const params = props?.metadata ? props.metadata : props;
    switch (params.version) {
        case 1:
            
            break;
        case 1.1:
            await v1_1()
            break;
        default:
            break;
    }

    async function v1_1() {
        let challenge;
        if (props.quest_data) {
            challenge = props.quest_data;
        }else{
            const res = await axios.get(`${ipfsPath}/${params.attributes.challenge_ipfs_url.replace("ipfs://", '')}`);
            challenge = res.data;
            console.log(challenge);
        }
        let obj = {
            title: challenge.title,
            description: challenge.description,
            image: params.image,
            creator: challenge.creator,
            properties: {
                questions: challenge.questions,
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
            metadata.metadata = obj;
        }else{
            metadata = obj
        }
    }
    
    return metadata
}