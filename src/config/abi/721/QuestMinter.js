export const questMinterABI = [
    {
        inputs: [{ internalType: "address", name: "quest_", type: "address" }],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    { inputs: [], name: "InvalidArray", type: "error" },
    { inputs: [], name: "InvalidSigner", type: "error" },
    { inputs: [], name: "NotCreator", type: "error" },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "signer",
                type: "address",
            },
        ],
        name: "SignerChanged",
        type: "event",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "uint32", name: "startTs", type: "uint32" },
                    { internalType: "uint32", name: "endTs", type: "uint32" },
                    { internalType: "string", name: "title", type: "string" },
                    { internalType: "string", name: "uri", type: "string" },
                ],
                internalType: "struct IQuest.QuestData",
                name: "questData",
                type: "tuple",
            },
            { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        name: "createQuest",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "tokenId", type: "uint256" },
            {
                components: [
                    { internalType: "uint32", name: "startTs", type: "uint32" },
                    { internalType: "uint32", name: "endTs", type: "uint32" },
                    { internalType: "string", name: "title", type: "string" },
                    { internalType: "string", name: "uri", type: "string" },
                ],
                internalType: "struct IQuest.QuestData",
                name: "questData",
                type: "tuple",
            },
            { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        name: "modifyQuest",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "quest",
        outputs: [
            { internalType: "contract IQuest", name: "", type: "address" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "signer_", type: "address" }],
        name: "setSigner",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "signer",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "newOwner", type: "address" },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
