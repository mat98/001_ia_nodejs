import { generateEmbeddings, loadJSONData } from "./main";
import { DataWithEmbeddings } from "./data_with_embedding.type";

function dotProduct(a: number[], b: number[]) {
    return a.map((value, index) => value * b[index]).reduce((a, b) => a + b, 0)
}


function cosineSimiliarity(a: number[], b: number[]) {
    const product = dotProduct(a, b);
    // m3: Math.sqrt => retorna a raiz quadrada
    const aMagnitude = Math.sqrt(dotProduct(a, b));
    const bMagnitude = Math.sqrt(dotProduct(b, a));

    return product / (aMagnitude * bMagnitude)
}


async function main() {
    const dataWithEmbeddings = loadJSONData<DataWithEmbeddings[]>('dataWithEmbeddings.json')
    const input = 'animal';

    // m3: gero os dados do array de números que representa a palavra animal
    const inputEmbedding = await generateEmbeddings(input);

    const similarities: {
        input: string,
        similiarity: number
    }[] = [];


    for (const entry of dataWithEmbeddings) {
        //m3: pego os dados do json ( array de números ) e verifico o quanto ele é próximo do input que insiro
        const similiarity = cosineSimiliarity(
            entry.embedding,
            inputEmbedding.data[0].embedding
        )
        similarities.push({
            input: entry.input,
            similiarity
        });

        console.log(`Similiarity of ${input} with:`)
        const sortedSimilarities = similarities.sort((a, b) => b.similiarity - a.similiarity);
    }
}

main();