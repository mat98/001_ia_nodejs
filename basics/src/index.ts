import { OpenAI } from 'openai'
import { encoding_for_model } from 'tiktoken'
import 'dotenv/config'

const openai = new OpenAI(
    {
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.OPENAI_API_KEY
    }
)

// max_tokens: LIMITAR A QUANTIDADE DE CARACTERES DE RESPOSTA DO MODELO
// role: system => É COMO O CHAT DEVE RESPONDER... NO CASO O PERFIL DE RESPOSTA DELE
// n => DEFINE O NÚMERO DE ESCOLHAS QUE A RESPOSTA IRÁ DAR PARA VC ESCOLHER
// seed => O SISTEMA FAZ O MELHOR PARA ACHAR O ESFORÇO SIMPLES DETERMINISTICO
async function main() {
    const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
            {
                role: 'system',
                content: `You respond like a cool bro, and you respond in JSON format, like this: 
                coolnessLevel: 1-10,
                answer: your answer`
            },
            {
                role: 'user',
                content: 'How tall is mount Everest?'
            }
        ],
        max_tokens: 100,
        n: 2,
        seed: 5555
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