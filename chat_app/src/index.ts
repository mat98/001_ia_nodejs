import OpenAI from 'openai'
import 'dotenv/config'
import { encoding_for_model } from 'tiktoken';

const openai = new OpenAI();
const encoder = encoding_for_model('gpt-3.5-turbo');

// m3: Definir limites de tokens usados
const MAX_TOKENS = 700;

// m3: Usado para deixar o contexto de mensagens, sem perder o contexto de duas perguntas ou mais que você está estruturando
// m3: Um grande problema de inserir mais contexto para as perguntas é que perdemos dinheiro conforme o contexto fica maior
const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: 'system',
        content: 'You are a helpful chatbot'
    }
]

async function createChatCompletion() {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: context
    })

    const responseMessage = response.choices[0].message;
    // m3: Isso aqui foi usado sem o uso da variável de contexto
    // context.push({
    //     role: 'assistant',
    //     content: responseMessage.content
    // })
    context.push(responseMessage);

    // m3: Ação para controlar o quanto de limite de tokens você pode utilizar
    if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
        deleteOlderMessages();
    }

    console.log(`${response.choices[0].message.role}: ${response.choices[0].message}`)
}

process.stdin.addListener('data', async function (input) {
    const userInput = input.toString().trim();
    context.push({
        role: 'user',
        content: userInput
    })
    await createChatCompletion();
})

// TODO: testar isso quando tiver tokens disponiveis
function deleteOlderMessages() {
    let contextLength = getContextLength();

    while (contextLength > MAX_TOKENS) {
        for (let i = 0; i < context.length; i++) {
            const message = context[i];
            if (message.role != 'system') {
                context.splice(i, 1);
                contextLength = getContextLength();
                console.log('New context length: ' + contextLength);
                break;
            }
        }
    }

    function getContextLength() {
        let lengthTokens = 0;
        for (const message of context) {
            if (typeof message.content == 'string') {
                lengthTokens += encoder.encode(message.content).length;
            } else if (Array.isArray(message.content)) {
                for (const messageContent of message.content) {
                    if (messageContent.type == 'text') {
                        lengthTokens += encoder.encode(messageContent.text).length;
                    }
                }
            }
        }
        return lengthTokens;
    }
}