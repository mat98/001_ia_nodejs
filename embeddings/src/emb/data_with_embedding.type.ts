export class DataWithEmbeddings {
    input: string = ''
    embedding: number[] = [];

    constructor(data?: Partial<DataWithEmbeddings>) {
        Object.assign(this, {
            input: '',
            embedding: []
        }, data);
    }
}
