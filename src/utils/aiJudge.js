/**
 * AI 判题服务
 * 使用 OpenRouter API 调用 AI 模型来判断代码逻辑是否符合题目要求
 */

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.REACT_APP_OPENROUTER_BASE_URL;
const OPENROUTER_MODEL = process.env.REACT_APP_OPENROUTER_MODEL;

// 调试信息
console.log('OpenRouter Config:', {
    apiKey: OPENROUTER_API_KEY ? '已配置' : '未配置',
    baseUrl: OPENROUTER_BASE_URL,
    model: OPENROUTER_MODEL
});

/**
 * 调用 AI 判断代码是否符合题目要求
 * @param {string} questionTitle - 题目标题
 * @param {string} questionDescription - 题目描述
 * @param {string} userCode - 用户提交的代码
 * @param {string} language - 编程语言
 * @returns {Promise<{correct: boolean, reason: string}>} - 返回判断结果和理由
 */
export async function judgeCodeWithAI(questionTitle, questionDescription, userCode, language) {
    try {
        // 检查环境变量
        if (!OPENROUTER_API_KEY || !OPENROUTER_BASE_URL || !OPENROUTER_MODEL) {
            throw new Error(`环境变量未配置: API_KEY=${!!OPENROUTER_API_KEY}, BASE_URL=${!!OPENROUTER_BASE_URL}, MODEL=${!!OPENROUTER_MODEL}`);
        }

        console.log('开始AI判题...', { questionTitle, language });

        // 构建系统提示词
        const systemPrompt = `你是一个专业的编程题评判助手。你需要分析用户提交的代码是否符合题目要求。

**重要：请统一使用中文回答，所有评判理由必须用中文表述。**

评判标准：
1. 代码逻辑是否正确实现了题目的核心要求
2. 代码思路是否合理，能否解决题目描述的问题
3. 代码是否有明显的逻辑错误或语法错误
4. 代码的实现方式是否可行

请返回 JSON 格式的评判结果，格式如下：
{
  "correct": true/false,
  "reason": "评判理由（请用中文详细说明代码的实现思路、优点或存在的问题）"
}

注意：
- 只要代码的核心逻辑正确，实现了题目的主要功能，就应该判定为正确（correct: true）
- 不要过于苛刻，允许有不同的实现方式和编程风格
- 如果代码有小的问题但整体思路正确，可以在理由中指出改进建议，但仍然判定为正确
- 只有当代码完全偏离题目要求或有严重逻辑错误时，才判定为错误（correct: false）
- 评判理由要具体明确，用中文说明代码的实现思路和评判依据
- **所有回复内容必须是中文**`;

        // 构建用户消息
        const userMessage = `题目标题：${questionTitle}

题目描述：
${questionDescription}

用户提交的代码（${language}）：
\`\`\`${language}
${userCode}
\`\`\`

请评判这段代码是否符合题目要求，并返回 JSON 格式的结果。重点关注代码的实现思路和逻辑是否正确。`;

        // 调用 OpenRouter API
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'DeCert AI Judge'
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API 请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // 解析 AI 返回的 JSON 结果
        let result;
        try {
            result = JSON.parse(content);
        } catch (e) {
            // 如果解析失败，尝试从文本中提取
            console.error('解析 AI 返回的 JSON 失败:', e);
            // 简单的回退逻辑
            const isCorrect = content.toLowerCase().includes('correct": true') ||
                            content.toLowerCase().includes('"correct":true');
            result = {
                correct: isCorrect,
                reason: content
            };
        }

        return result;
    } catch (error) {
        console.error('AI 判题失败:', error);
        throw error;
    }
}
