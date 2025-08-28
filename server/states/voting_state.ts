import { StateData } from "./game_state";

type Count = {
    [name: string]: number;
};

export class VotingData extends StateData {
    count: Count;
    constructor(userList: string[]) {
        // TODO: This needs to be more dynamic. For example, it needs to be able to handle if a user leaves
        super();

        this.count = {};
        userList.forEach(name => this.count[name] = 0);
    }
    
    getStateName(): string {
        return 'voting';
    }

    handleNewUser(name: string) {
        this.count[name] = 0; // New users start with 0 votes
    }

    handleUserLeft(name: string) {
        delete this.count[name];
    }
}
