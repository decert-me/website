/**
 * AI 生成挑战服务
 * 使用 OpenRouter API 调用 AI 模型来根据文章内容生成 DeCert 挑战题目
 */

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.REACT_APP_OPENROUTER_BASE_URL;
const OPENROUTER_MODEL = process.env.REACT_APP_OPENROUTER_MODEL;

// 调试信息
console.log('AI Generate Challenge Config:', {
    apiKey: OPENROUTER_API_KEY ? '已配置' : '未配置',
    baseUrl: OPENROUTER_BASE_URL,
    model: OPENROUTER_MODEL
});

/**
 * 默认的 AI 提示词模板
 * @param {string} questionType - 题目类型：选择题、填空题、编程题、开放题
 * @param {Array} categories - 分类列表
 * @param {Array} chains - 链列表
 * @returns {string} - 默认提示词
 */
export function getDefaultPrompt(questionType, categories = [], chains = []) {
    // 构建分类选项文本
    const categoryText = categories.length > 0
        ? categories.map(c => `${c.ID}: ${c.Chinese || c.English}`).join(', ')
        : 'Solidity, DeFi, NFT, DAO, GameFi, Layer2, 安全, 工具';

    // 构建链选项文本
    const chainText = chains.length > 0
        ? chains.map(c => `${c.id}: ${c.name}`).join(', ')
        : '10: Optimism, 137: Polygon, 42161: Arbitrum';

    const basePrompt = `你是一名资深的 Web3 专家，同时也是资深的 Web3 培训老师，现在需要你根据文章的内容和知识点，生成一个对应的${questionType}挑战。

该挑战需要包括以下关键信息：
- **挑战标题**：简洁明了，体现文章核心知识点
- **挑战描述**：详细说明挑战的目标和要求（200-300字）
- **难度**：从以下选项中选择：0-简单、1-中等、2-困难
- **分类**：从以下分类ID中选择1-3个合适的：${categoryText}
- **时长**：预计完成时间（秒），可选：600（10分钟）、1800（30分钟）、3600（1小时）、7200（2小时）、14400（4小时）
- **链ID**：从以下链ID中选择一个：${chainText}
- **题目**：根据题目类型生成符合格式的题目数组
- **总分**：所有题目的分数总和
- **及格分**：建议为总分的60%-80%
- **推荐教程**：相关学习资源的JSON数组，格式为 [{"title": "教程标题", "link": "教程链接"}]

`;

    const questionFormats = {
        '填空题': `**题目格式要求（填空题）：**
题目应该是一个数组，每个题目对象包含：
- type: "fill_blank"
- score: 分数（建议10-20分）
- title: 题目标题
- options: 正确答案数组，如 ["正确答案1", "正确答案2"]
- answers: 正确答案字符串或数组（如果有多个填空）

示例：
[
    {
        "type": "fill_blank",
        "score": 10,
        "title": "以太坊的共识机制",
        "options": ["PoS"],
        "answers": "PoS"
    }
]`,

        '选择题': `**题目格式要求（选择题）：**
题目应该是一个数组，可以包含单选题或多选题：

单选题：
- type: "multiple_choice"
- score: 分数（建议10分）
- title: 题目标题
- options: 选项数组（包含正确和错误答案）
- answers: 正确答案的索引（数字，从0开始）

多选题：
- type: "multiple_response"
- score: 分数（建议15分）
- title: 题目标题
- options: 选项数组
- answers: 正确答案的索引数组，如 [0, 1]

示例：
[
    {
        "type": "multiple_choice",
        "score": 10,
        "title": "以下哪个是以太坊的原生代币？",
        "options": ["ETH", "BTC", "USDT"],
        "answers": 0
    },
    {
        "type": "multiple_response",
        "score": 15,
        "title": "以下哪些是Layer2解决方案？",
        "options": ["Optimism", "Arbitrum", "Bitcoin", "Polygon"],
        "answers": [0, 1, 3]
    }
]`,

        '开放题': `**题目格式要求（开放题）：**
题目应该是一个数组，每个题目对象包含：
- type: "open_quest"
- score: 分数（建议15-20分）
- title: 题目标题（问题描述）
- answers: null（开放题没有标准答案）

示例：
[
    {
        "type": "open_quest",
        "score": 20,
        "title": "请描述你对DeFi去中心化金融的理解，以及它与传统金融的区别",
        "answers": null
    }
]`,

        '编程题': `**题目格式要求（编程题）：**
题目应该是一个数组，每个题目对象包含：
- type: "coding"
- score: 分数（建议20-30分）
- title: 题目标题
- description: 详细的题目描述，包括功能要求、输入输出示例
- languages: 支持的编程语言数组，如 ["Solidity", "JavaScript"]
- code_snippets: 初始代码模板数组
- spj_code: 测试代码数组（可选，如果有的话）
- answers: null

示例：
[
    {
        "type": "coding",
        "score": 25,
        "title": "实现一个简单的存款合约",
        "description": "创建一个Solidity智能合约，实现存款功能。要求：\\n1. 用户可以存入ETH\\n2. 记录每个用户的存款金额\\n3. 存款金额必须大于0",
        "languages": ["Solidity"],
        "code_snippets": [
            {
                "lang": "Solidity",
                "code": "// SPDX-License-Identifier: MIT\\npragma solidity ^0.8.0;\\n\\ncontract Deposit {\\n    // 在这里实现你的代码\\n}",
                "correctAnswer": ""
            }
        ],
        "spj_code": [],
        "answers": null
    }
]`
    };

    return basePrompt + questionFormats[questionType];
}

/**
 * 获取问题类型对应的系统提示词
 * @param {string} questionType - 题目类型
 * @returns {string} - 系统提示词
 */
function getSystemPrompt(questionType) {
    return `你是一个专业的区块链教育内容设计助手。你需要根据提供的文章内容，生成符合 DeCert 平台要求的完整挑战信息。

**重要：请统一使用中文回答，所有内容必须用中文表述。**

你需要返回一个包含以下字段的 JSON 对象：

{
  "title": "挑战标题（简洁明了，体现文章核心知识点）",
  "description": "挑战描述（详细说明挑战的目标和要求，200-300字）",
  "difficulty": 0,  // 难度：0-简单、1-中等、2-困难
  "categories": [1, 2],  // 分类ID数组（1-3个）
  "estimatedTime": 3600,  // 预计完成时间（秒）
  "chainId": 10,  // 链ID
  "questions": [],  // 题目数组（根据题目类型使用不同格式）
  "totalScore": 100,  // 总分（所有题目分数之和）
  "passingScore": 60,  // 及格分（建议总分的60%-80%）
  "tutorials": [  // 推荐教程数组
    {
      "title": "教程标题",
      "link": "教程链接"
    }
  ]
}

**注意事项：**
1. 所有文本内容必须使用中文
2. categories 必须是数字数组，从用户提供的分类列表中选择
3. chainId 必须从用户提供的链列表中选择
4. questions 数组的格式取决于题目类型
5. totalScore 必须等于所有题目的 score 总和
6. passingScore 建议为 totalScore 的 60%-80%
7. tutorials 可以包含1-3个相关教程链接
8. 严格按照 JSON 格式返回，不要包含任何其他说明文字`;
}

/**
 * 调用 AI 生成挑战题目
 * @param {string} articleUrl - 文章 URL
 * @param {string} questionType - 题目类型：选择题、填空题、编程题、开放题
 * @param {string} customPrompt - 自定义提示词（可选）
 * @param {Array} categories - 分类列表
 * @param {Array} chains - 链列表
 * @returns {Promise<{result: Object, rawResponse: string}>} - 返回生成的题目数据和原始回复
 */
export async function generateChallengeWithAI(articleUrl, questionType, customPrompt = '', categories = [], chains = []) {
    try {
        // 检查环境变量
        if (!OPENROUTER_API_KEY || !OPENROUTER_BASE_URL || !OPENROUTER_MODEL) {
            throw new Error(`环境变量未配置: API_KEY=${!!OPENROUTER_API_KEY}, BASE_URL=${!!OPENROUTER_BASE_URL}, MODEL=${!!OPENROUTER_MODEL}`);
        }

        console.log('开始 AI 生成挑战...', { questionType, articleUrl });

        // 构建系统提示词
        const systemPrompt = getSystemPrompt(questionType);

        // 构建用户消息（包含 URL）
        const userPrompt = customPrompt || getDefaultPrompt(questionType, categories, chains);
        const userMessage = `${userPrompt}

文章链接：${articleUrl}

请访问上述链接，阅读文章内容，然后根据文章内容生成一个完整的${questionType}挑战，并严格按照系统提示中指定的 JSON 格式返回。`;

        // 调用 OpenRouter API
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'DeCert AI Challenge Generator'
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.8,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API 请求失败: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // 解析 AI 返回的 JSON 结果
        let result;
        try {
            result = JSON.parse(content);
            console.log('AI 生成的挑战:', result);
        } catch (e) {
            console.error('解析 AI 返回的 JSON 失败:', e);
            console.error('原始内容:', content);
            throw new Error('AI 返回的数据格式不正确，请重试');
        }

        // 验证返回的数据格式
        if (!result.title || !result.description || !result.questions) {
            throw new Error('AI 返回的挑战数据缺少必要字段');
        }

        // 返回解析后的结果和原始回复
        return {
            result: result,
            rawResponse: content
        };
    } catch (error) {
        console.error('AI 生成挑战失败:', error);
        throw error;
    }
}

/**
 * 获取文章内容
 * @param {string} articleUrl - 文章 URL
 * @returns {Promise<{html: string, text: string}>} - 返回文章内容
 */
export async function fetchArticleContent(articleUrl) {
    try {
        console.log('正在获取文章内容...', articleUrl);

        // 使用 CORS 代理服务来避免跨域问题
        // allorigins.win 是一个免费的 CORS 代理服务
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(articleUrl)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`获取文章失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const html = data.contents;

        // 简单的 HTML 内容提取
        // 移除 script 和 style 标签
        let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

        // 提取文本内容（保留 HTML 结构用于显示）
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        // 查找文章主体内容（针对登链社区的文章结构）
        const articleBody = doc.querySelector('.article-content') ||
                          doc.querySelector('.post-body') ||
                          doc.querySelector('article') ||
                          doc.querySelector('.content') ||
                          doc.querySelector('main') ||
                          doc.body;

        if (!articleBody) {
            throw new Error('无法提取文章内容，请尝试手动粘贴');
        }

        // 清理一些不需要的元素
        const elementsToRemove = articleBody.querySelectorAll('script, style, iframe, .ad, .advertisement');
        elementsToRemove.forEach(el => el.remove());

        return {
            html: articleBody.innerHTML,
            text: articleBody.textContent || articleBody.innerText
        };
    } catch (error) {
        console.error('获取文章内容失败:', error);
        throw new Error('获取文章内容失败，可能是跨域问题。请使用"手动粘贴"功能');
    }
}
