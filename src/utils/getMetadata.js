import { ipfsJson } from "@/request/api/public";
import { generateUUID } from "./getUuid";
import axios from "axios";
import { constans } from "./constans";

export async function getMetadata({values, address, questions, answers, image}) {
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
    const questHash = await ipfsJson({body: obj});
    const uuid = generateUUID();
    const nft = {
        name: "Decert Badge",
        description: "NFT 描述",
        image: image,
        attributes: {
            challenge_ipfs_url: "ipfs://"+questHash.hash,
            challenge_url: `https://decert.me/quests/${uuid}`,
            challenge_title: values.title,
            creator: address,
            difficulty: values.difficulty !== undefined ? values.difficulty : null,
        },
        external_url: "https://decert.me",
        version: version
    }
    const nftHash = await ipfsJson({body: nft});
    return nftHash
}

export async function setMetadata(props) {
    const { ipfsPath } = constans();
    let metadata = props;
    const params = props.metadata;
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
        const res = await axios.get(`${ipfsPath}/${params.attributes.challenge_ipfs_url.replace("ipfs://", '')}`);
        const challenge = res.data;
        
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
        metadata.metadata = obj;
    }
    
    return metadata
}