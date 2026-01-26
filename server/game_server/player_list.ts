import { Validator } from "../handlers/validator";
import { GMEventContext } from "../modes/game_mode";
import { Action, buildActionSchema } from "./action";
import { EventProvider } from "./event_provider";
import { Player } from "./player";
import { PlayerLeaveData, playerLeaveDataSchema } from "./server_types";

export class PlayerList {
    private players: Map<string | undefined, Player>;
    private eventProvider: EventProvider<GMEventContext>;
    private validator: Validator<GMEventContext>;

    constructor(eventProvider: EventProvider<GMEventContext>) {
        this.players = new Map<string | undefined, Player>();
        this.validator = new Validator();
        this.validator.addPair({
            schema: buildActionSchema("player_leave", playerLeaveDataSchema),
            handler: (action, context) => this.onPlayerLeave(action, context)
        });

        this.eventProvider = eventProvider;
        this.eventProvider.onAction((action, context) => {{
            this.validator.validateAndHandle(action, context);
        }});
    }

    addPlayer(player: Player) {
        this.players.set(player.username, player);
    }

    removePlayer(player: Player) {
        this.players.delete(player.username);
    }

    broadcast(action: Action<object>) {
        this.players.forEach(player => player.getConnection().sendAction(action));
    }

    getUsernames(): string[] {
        const usernameArray: string[] = [];
        this.players.forEach(player => {
            if (player.username !== undefined) {
                usernameArray.push(player.username)
            }
        })

        return usernameArray
    }

    getPlayerByUsername(username: string): Player | undefined {
        return this.players.get(username);
    }

    getHost(): Player | undefined {
        return this.players.get(undefined);
    }

    get numPlayers() {
        return this.players.size;
    }

    private onPlayerLeave(action: Action<PlayerLeaveData>, context: GMEventContext) {
        const player: Player = action.data.player as Player;
        this.removePlayer(player);
    }
}