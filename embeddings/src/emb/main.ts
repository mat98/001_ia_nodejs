import OpenAi from 'openai';
import { readFileSync, writeFile, writeFileSync } from 'fs';
import { join } from 'path';
import { DataWithEmbeddings } from './data_with_embedding.type';

const openai = new OpenAi();

// m3: cheaper (text-embedding-3-small) => modelo mais barato
export async function generateEmbeddings(input: string | string[]) {
    const response = await openai.embeddings.create({
        input: input,
        model: 'text-embedding-3-small'
    })
    // m3: verificar o dado de resposta do embedding
    console.log(response.data[0].embedding);
    return response;
}

// m3: Pegar o conteúdo JSON do arquivo ( pegar o array que estamos trabalhando )
export function loadJSONData<T>(fileName: string): T {
    const path = join(__dirname, fileName);
    const rawData = readFileSync(path);
    return JSON.parse(rawData.toString())
}

function saveDataToJsonFile(data: any, fileName: string) {
    const dataString = JSON.stringify(data);
    const dataBuffer = Buffer.from(dataString);
    const path = join(__dirname, fileName);
    writeFileSync(path, dataBuffer);
    console.log(`saved data to ${fileName}`);
}

// generateEmbeddings('Cat');
async function main() {
    const data = loadJSONData<string[]>('data.json');

    const embeddings = await generateEmbeddings(data);
    const dataWithEmbeddings: DataWithEmbeddings[] = [];

    for (let i = 0; i < data.length; i++) {
        dataWithEmbeddings.push({
            input: data[i],
            embedding: embeddings.data[i].embedding
        })
    }
    saveDataToJsonFile(dataWithEmbeddings, 'dataWithEmbedings.json')
}

main();