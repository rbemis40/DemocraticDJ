export interface IdProvider {
    generateId(): string;
    freeId(id: string): void;
}

export class SeqIdProvider implements IdProvider {
    private curId: number;

    constructor() {
        this.curId = 0;
    }

    generateId(): string {
        const newId: string = this.curId.toString();
        this.curId += 1;
        return newId;
    }

    freeId(id: string) {}
}