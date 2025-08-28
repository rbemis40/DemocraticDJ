import { WebSocket } from "ws";
import { ClientMsg, ConnectionMap, InternalMsg, JoinedMode_ClientMsg, ServerMsg } from "../game_servers/gs_types";
import { GameMode, GameModeName } from "./game_mode";
import { UserManager } from "../user_manager";
import { UserJoin_ClientMsg, UserLeft_ClientMsg } from "../game_servers/simple_gs";


export interface AddVote_ClientMsg extends ClientMsg {
    type: 'add_vote';
    user_name: string;    
}

export interface VoteCount_ServerMsg extends ServerMsg {
    type: 'vote_count';
    count: {[name: string]: number}; 
};

type VoteCount = {
    [name: string]: number;
};

export class VotingMode implements GameMode {
    private voteCount : VoteCount;
    
    constructor(userList: string[]) {
        this.voteCount = {};
        userList.forEach(name => this.voteCount[name] = 0); // Initialize all votes to zero
    }

    getModeName(): GameModeName {
        return 'voting';
    }

    handleClientMsg(msg: ClientMsg, clientWs: WebSocket, cons: ConnectionMap, um: UserManager): GameModeName {
        switch (msg.type) {
            case 'add_vote': {
                // TODO: Make sure user didn't vote for themselves
                const addMsg = msg as AddVote_ClientMsg;
                
                const voterName = um.getUserInfoByToken(cons.socketToToken.get(clientWs)).name;


                this.voteCount[addMsg.user_name] += 1;

                this.sendVoteCount(cons);
                break;
            }
            case 'user_left': {
                const leaveMsg = msg as UserLeft_ClientMsg;
                const userInfo = um.getUserInfoByToken(leaveMsg.user_token);
                delete this.voteCount[userInfo.name];
            
                this.sendVoteCount(cons);
                break;
            }
            case 'joined_mode': {
                const joinMsg = msg as JoinedMode_ClientMsg;
                if (joinMsg.mode === this.getModeName()) {
                    // Get the username to keep track of vote count
                    const userInfo = um.getUserInfoByToken(cons.socketToToken.get(clientWs));

                    if (userInfo.name !== undefined) {
                        this.voteCount[userInfo.name] = 0;
                    }

                    this.sendVoteCount(cons);
                }
                break;
            }
        }
        return this.getModeName();
    }

    handleInternalMsg(msg: InternalMsg, cons: ConnectionMap, um: UserManager): GameModeName {
        return this.getModeName();
    }

    private sendVoteCount(cons: ConnectionMap) {
        // Send updated count back to user
        const vcMsg: VoteCount_ServerMsg = {
            type: 'vote_count',
            count: this.voteCount
        };

        const vcMsgStr = JSON.stringify(vcMsg);
        cons.tokenToSocket.forEach(curWs => curWs.send(vcMsgStr));
    }
}