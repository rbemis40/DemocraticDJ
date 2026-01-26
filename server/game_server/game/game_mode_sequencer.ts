import { JSONSchemaType } from "ajv";
import { Validator } from "../../handlers/validator";
import { GameMode, ServerContext } from "../../modes/game_mode";
import { LobbyMode } from "../../modes/lobby/lobby_mode";
import { SelectVotersMode } from "../../modes/select_voters/select_voters_mode";
import { Action, buildActionSchema } from "../action";
import { EventProvider } from "../event_provider";

interface NextGameModeData {}

const nextGameModeSchema: JSONSchemaType<NextGameModeData> = {
    type: "object"
};

export class GameModeSequencer {
    private mode: GameMode;
    private eventProvider: EventProvider<ServerContext>;
    private validator: Validator<ServerContext>;

    constructor(eventProvider: EventProvider<ServerContext>) {
        this.eventProvider = eventProvider;

        this.validator = new Validator();
        this.validator.addPair({
            schema: buildActionSchema("next_game_mode", nextGameModeSchema),
            handler: (data, context) => this.onNextGameMode(data, context)
        });

        this.eventProvider.onAction((action: Action<object>, context: ServerContext) => {
            this.validator.validateAndHandle(action, context);
        });

        this.mode = new LobbyMode(this.eventProvider);
        this.mode.makeActive();
    }

    getCurrentModeName(): string {
        return this.mode.getName();
    }

    private onNextGameMode(action: Action<NextGameModeData>, context: ServerContext) {
        console.log("Game.handleInternalAction:");
        console.log(action);
        switch(action.action) {
            case "next_game_mode": {
                this.mode.makeInactive();
                this.mode = new SelectVotersMode(context.allPlayers, this.eventProvider, context);
                this.mode.makeActive();
                context.allPlayers.broadcast({
                    action: "change_mode",
                    data: {
                        gamemode: this.mode.getName()
                    }
                });
                break;
            }
        }

        
    }
}