import { GameMode } from "../modes/game_mode.js";

type GameModeFactory = () => GameMode;

export class GameModeSequencer {
    private modeOrder: GameModeFactory[];
    private curMode: GameMode;
    private modeIndex: number;

    constructor(modeOrder: GameModeFactory[]) {
        this.modeOrder = modeOrder;
        this.modeIndex = 0;
        this.curMode = this.createNextMode();
    }

    getCurrentMode(): GameMode {
        return this.curMode;
    }

    nextMode() {
        this.modeIndex = (this.modeIndex + 1) % this.modeOrder.length;
        this.curMode = this.createNextMode();
    }

    private createNextMode() {
        if (this.modeIndex < 0 || this.modeIndex >= this.modeOrder.length) {
            throw new Error("Invalid mode");
        }

        return this.modeOrder[this.modeIndex]();
    }
}