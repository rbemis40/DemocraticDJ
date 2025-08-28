import { WebSocket } from "ws";
import { ClientMsg, ConnectionMap, InternalMsg, JoinedMode_ClientMsg, ServerMsg } from "../game_servers/gs_types";
import { GameMode, GameModeName } from "./game_mode";
import { UserManager } from "../user_manager";
import { UserLeft_ClientMsg } from "../game_servers/simple_gs";


interface AddVote_ClientMsg extends ClientMsg {
    type: 'add_vote';
    user_name: string;    
}

interface VoteCount_ServerMsg extends ServerMsg {
    type: 'vote_count';
    count: {[name: string]: number}; 
};

interface BeginCountdown_ServerMsg extends ServerMsg {
    type: 'begin_countdown',
    seconds: number
};

interface EndCountdown_ServerMsg extends ServerMsg {
    type: 'end_countdown',
};

type VoteCount = {
    [name: string]: number;
};

interface BeginCountdown_InternalMsg extends InternalMsg {
    type: 'begin_countdown',
    seconds: number;
};

interface EndCountdown_InternalMsg extends InternalMsg {
    type: 'end_countdown'
}

export class VotingMode implements GameMode {
    private voteCount : VoteCount;
    private voterToVote: Map<string, string>; // Stores a record of who has already voted and on who
    
    constructor(userList: string[], sendInternalMsg: (msg: InternalMsg) => void) {
        this.voteCount = {};
        this.voterToVote = new Map();
        userList.forEach(name => this.voteCount[name] = 0); // Initialize all votes to zero

        const numSeconds = 10;
        setTimeout(() => {
            // After ten seconds, begin the countdown
            sendInternalMsg({
                type: 'begin_countdown',
                seconds: numSeconds
            } as BeginCountdown_InternalMsg);

            // After ten more (plus a little delay), end the countdown and show results
            setTimeout(() => {
                sendInternalMsg({
                    type: 'end_countdown',
                    seconds: numSeconds
                } as EndCountdown_InternalMsg);
            }, (numSeconds * 1000) + 500)

        }, numSeconds * 1000);
    }

    getModeName(): GameModeName {
        return 'voting';
    }

    handleClientMsg(msg: ClientMsg, clientWs: WebSocket, cons: ConnectionMap, um: UserManager): GameModeName {
        switch (msg.type) {
            case 'add_vote': {
                const addMsg = msg as AddVote_ClientMsg;
                
                const voterName = um.getUserInfoByToken(cons.socketToToken.get(clientWs)).name;

                if (voterName === addMsg.user_name) { // Make sure they aren't voting for themselves
                    // TODO: Send an error so UI can update
                    break;
                }

                if (!this.voterToVote.has(voterName)) { // It's this person's first time voting
                    this.voteCount[addMsg.user_name] += 1;
                }
                else { // Change their vote to the new person
                    const prevVote = this.voterToVote.get(voterName);
                    if (prevVote in this.voteCount) { // Make sure the person they previously voted on hasn't left
                        this.voteCount[this.voterToVote.get(voterName)] -= 1; // Unvote
                    }
                    this.voteCount[addMsg.user_name] += 1; // Vote
                }

                this.voterToVote.set(voterName, addMsg.user_name);
                this.sendVoteCount(cons);
                break;
            }
            case 'user_left': {
                const leaveMsg = msg as UserLeft_ClientMsg;
                const userInfo = um.getUserInfoByToken(leaveMsg.user_token);

                // Remove their vote (if they voted)
                const prevVote = this.voterToVote.get(userInfo.name);
                if (prevVote in this.voteCount) {
                    this.voteCount[prevVote] -= 1;
                }

                delete this.voteCount[userInfo.name];
                delete this.voterToVote[userInfo.name];
            
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
        switch (msg.type) {
            case 'begin_countdown':
                // Forward this message to every client
                cons.tokenToSocket.forEach(curWs => curWs.send(JSON.stringify(msg as BeginCountdown_ServerMsg)));
                break;
            case 'end_countdown':
                cons.tokenToSocket.forEach(curWs => curWs.send(JSON.stringify(msg as EndCountdown_ServerMsg)));
                break;
        }

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