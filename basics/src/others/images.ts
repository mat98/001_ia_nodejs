import { OpenAI } from 'openai'
import { createReadStream, writeFileSync } from 'fs';

const openai = new OpenAI();

/*
m3: aqui ele retorna um objeto com a URL da imagem gerada pela IA
    exemplo:
    {
        created: timestamp,
        data: [
            {
                ur: ( URL IMAGEM GERADA )
            }
        ]
    }
*/
async function generateFreeImage() {
    const response = await openai.images.generate({
        prompt: 'A photo of a cat on a mat',
        model: 'dall-e-2',
        style: 'vivid',
        size: '256x256',
        quality: 'standard',
        n: 1
    });
    console.log(response);
}

/*
m3: aqui ele retorna a imagem gerada pela IA de forma local
*/
async function generateFreeLocalImage() {
    const response = await openai.images.generate({
        prompt: 'A photo of a cat on a mat',
        model: 'dall-e-2',
        style: 'vivid',
        size: '256x256',
        quality: 'standard',
        n: 1,
        response_format: 'b64_json'
    })
    const rawImage = response.data[0].b64_json;
    if (rawImage) {
        writeFileSync('catMat.png', Buffer.from(rawImage, 'base64'))
    }
}

/*
m3: aqui ele retorna variações de uma imagem criada localmente e gerando assim
novas possibilidades de imagem
- o salvamento tbm é feito local
*/
async function generateImageVariation() {
    const response = await openai.images.edit({
        image: createReadStream('city.png'),
        mask: createReadStream('city.png'), // => m3: define onde pode ser colocado a edicao da imagem ( nao fiz )
        prompt: 'add thunderstorm to the city',
        model: 'dall-e-2',
        response_format: 'b64_json'
    })
    const rawImage = response.data[0].b64_json;
    if (rawImage) {
        writeFileSync('catMat.png', Buffer.from(rawImage, 'base64'))
    }
}

generateFreeLocalImage();
generateImageVariation();