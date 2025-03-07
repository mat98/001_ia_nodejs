import { OpenAI } from 'openai'
import { encoding_for_model } from 'tiktoken'
import 'dotenv/config'

const openai = new OpenAI(
    {
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.OPENAI_API_KEY
    }
)

async function main() {
    console.log(process.env.OPENAI_API_KEY)
    const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{
            role: 'user',
            content: 'How tall is mount Everest?'
        }],

    })
    console.log(response.choices[0].message.content)
}

function encondePrompt() {
    const prompt = "How are you today?"
    const encoder = encoding_for_model('gpt-3.5-turbo');
    const words = encoder.encode(prompt);
    console.log(words);
    // RETORNO => Uint32Array(5) [ 4438, 527, 499, 3432, 30 ]
}

encondePrompt();