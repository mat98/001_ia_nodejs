// m3: Importa a lib da OpenAI pra usar os modelos de transcrição, tradução e TTS
import OpenAI from "openai";

// m3: Módulos nativos do Node: um pra ler o arquivo de áudio, outro pra salvar o resultado
import { createReadStream, writeFileSync } from "fs";

// m3: Cria uma instância do cliente da OpenAI, já usando a chave da API configurada no ambiente
const openai = new OpenAI();


// m3: Transcreve um áudio em inglês para texto usando o modelo Whisper
// m3: Aqui ele pega um .m4a e devolve o que foi falado em formato texto
async function createTranscription() {
    const response = await openai.audio.transcriptions.create({
        file: createReadStream('AudioSample.m4a'),
        model: 'whisper-1',
        language: 'en' // m3: define que o áudio está em inglês
    });

    // m3: Mostra o resultado da transcrição no terminal
    console.log(response);
}


// m3: Traduz um áudio falado em francês para inglês
// m3: O Whisper detecta o idioma automaticamente e retorna o texto já traduzido
async function translate() {
    const response = await openai.audio.translations.create({
        file: createReadStream('FrenchSample.m4a'),
        model: 'whisper-1'
    });

    // m3: Exibe o texto traduzido no console
    console.log(response);
}


// m3: Converte um texto para áudio com voz sintetizada (text-to-speech)
// m3: Isso aqui gera um arquivo de voz falando o texto que você passar
async function textToSpeech() {
    const sampleText = 'France is a country from Europe. It is located in Western Europe and is known for its rich history, world-famous cuisine, and stunning architecture';

    const response = await openai.audio.speech.create({
        input: sampleText,
        voice: 'alloy',        // m3: escolhe o tipo de voz (ex: alloy, echo, fable, etc.)
        model: 'tts-1',
        response_format: 'mp3' // m3: formato do áudio de saída
    });

    // m3: Pega o áudio retornado da API e transforma num buffer pra salvar
    const buffer = Buffer.from(await response.arrayBuffer());

    // m3: Salva o resultado no disco como France.mp3
    writeFileSync('France.mp3', buffer);
}
