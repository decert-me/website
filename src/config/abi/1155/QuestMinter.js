export const questMinterABI = [
    {
        inputs: [
            { internalType: "address", name: "badge_", type: "address" },
            { internalType: "address", name: "quest_", type: "address" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    { inputs: [], name: "InvalidArray", type: "error" },
    { inputs: [], name: "InvalidSigner", type: "error" },
    { inputs: [], name: "NonexistentToken", type: "error" },
    { inputs: [], name: "NotCreator", type: "error" },
    { inputs: [], name: "NotInTime", type: "error" },
    { inputs: [], name: "OverLimit", type: "error" },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
        ],
        name: "Airdroped",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "Claimed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "Donation",
        type: "event",
    },
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
            { internalType: "uint256[]", name: "tokenIds", type: "uint256[]" },
            { internalType: "address[]", name: "receivers", type: "address[]" },
            { internalType: "uint256[]", name: "scores", type: "uint256[]" },
            { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        name: "airdropBadge",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "badge",
        outputs: [
            { internalType: "contract IBadge", name: "", type: "address" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "tokenId", type: "uint256" },
            { internalType: "uint256", name: "score", type: "uint256" },
            { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        name: "claim",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "uint32", name: "startTs", type: "uint32" },
                    { internalType: "uint32", name: "endTs", type: "uint32" },
                    {
                        internalType: "uint192",
                        name: "supply",
                        type: "uint192",
                    },
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
                    {
                        internalType: "uint192",
                        name: "supply",
                        type: "uint192",
                    },
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
        inputs: [
            { internalType: "uint256", name: "tokenId", type: "uint256" },
            { internalType: "string", name: "uri", type: "string" },
            { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        name: "setBadgeURI",
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
        inputs: [],
        name: "startTokenId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
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
    {
        inputs: [
            { internalType: "uint256", name: "tokenId", type: "uint256" },
            { internalType: "uint256", name: "score", type: "uint256" },
            { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        name: "updateScore",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];