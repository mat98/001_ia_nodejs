// m3: passos que iram ser seguidos

// configure chat tools  ( first OpenAi call)
// decide if tool call is required
// invoke the pool
// make a second openAI  call with the pool response

import OpenAI from "openai";

const openAI = new OpenAI();

// m3: ferramentas são boas para pegar respostas em tempo real 
// do que está acontecendo do mundo real

function getTimeOfDay() {
    return '5:45';
}

function getOrderStatus(orderId: string) {
    console.log(`Getting the status of order ${orderId}`)
    const orderAsNumber = parseInt(orderId);

    if (orderAsNumber % 2 == 0) {
        return 'IN_PROGRESS'
    }

    return 'COMPLETED'
}

async function callOpenAIWithTools() {
    const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: 'You re a helpful assistant that gives information about the time of day'
        },
        {
            role: 'user',
            content: 'What is the time of day?'
        }
    ]

    // configure chat tools ( first openAI call )
    const response = await openAI.chat.completions.create({
        model: 'gpt-3.5-turbo-0613',
        messages: context,
        tools: [
            {
                type: 'function',
                function: { name: 'getTimeOfDay', description: 'Get the time of day' }
            },
            {
                type: 'function',
                function: {
                    name: 'getOrderStatus',
                    description: 'Returns the status of an order',
                    parameters: {
                        type: 'object',
                        properties: {
                            orderId: {
                                type: 'string',
                                description: 'The id of the order to get the status of'
                            },
                            required: ['orderId']
                        }
                    }
                }
            }
        ],
        tool_choice: 'auto' // the engine will decide which tool to use
    });

    // m3: pode querer chamar uma função definida por você (o que eles chamam de "tools" ou "function calling").
    // m3: .finish_reason == 'tool_calls': quer dizer que a resposta não é só texto, mas uma instrução para chamar uma função.
    const willInvokeFunction = response.choices[0].finish_reason == 'tool_calls';
    const toolCall = response.choices[0].message.tool_calls![0];

    if (willInvokeFunction) {
        // m3: contém o nome da função que o modelo sugere que fosse chamada
        const toolName = toolCall.function.name;

        // m3: ChatGPT sugeriu usar uma ferramenta chamada getTimeOfDay, então o sistema externo executa essa função 
        // e envia a resposta de volta como se fosse uma mensagem gerada por essa ferramenta, para continuar a conversa com base nisso
        if (toolName == 'getTimeOfDay') {
            const toolResponse = getTimeOfDay();
            context.push(response.choices[0].message);
            context.push({
                role: 'tool',
                content: toolResponse,
                tool_call_id: toolCall.id
            })
        }


        if (toolName == 'getOrderStatus') {
            const rawArgument = toolCall.function.arguments;
            const parsedArguments = JSON.parse(rawArgument);
            const toolResponse = getOrderStatus(parsedArguments.orderId);
            context.push(response.choices[0].message);
            context.push({
                role: 'tool',
                content: toolResponse,
                tool_call_id: toolCall.id
            })
        }

        const secondResponse = await openAI.chat.completions.create({
            model: 'gpt-3.5-turbo-0613',
            messages: context
        });
        console.log(secondResponse.choices[0].message.content);
    }
}


callOpenAIWithTools();