import { OpenAI } from 'openai'
import 'dotenv/config'

const openai = new OpenAI(
    {
        apiKey: process.env.OPENAI_API_KEY
    }
)

async function main() {
    console.log(process.env.OPENAI_API_KEY)
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
            role: 'user',
            content: 'How tall is mount Everest?'
        }],

    })
    console.log(response.choices[0].message.content)
}

main();