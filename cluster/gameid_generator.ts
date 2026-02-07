export class GameIdGenerator {
    private inUseIds: Set<number>;
    private minId: number;
    private maxId: number;
    
    constructor(minId: number, maxId: number) {
        this.inUseIds = new Set();
        this.minId = minId;
        this.maxId = maxId;
    }    

    genNewId(): number {
        let genId: number;
        do {
            genId = Math.floor((Math.random() * (this.maxId - this.minId))) + this.minId;
        } while (this.inUseIds.has(genId));

        this.inUseIds.add(genId);

        return genId;
    }

    freeId(id: number): boolean {
        return this.inUseIds.delete(id);
    }
}