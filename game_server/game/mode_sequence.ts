import { GameMode } from "../modes/game_mode.js";

export interface ModeSequence {
    getMode(): GameMode | undefined;
    nextMode(): GameMode | undefined;
}

export type ModeSequenceFactory = () => ModeSequence;
export type GameModeFactory = () => GameMode;

export class BasicSequence implements ModeSequence {
    private modeFactories: GameModeFactory[];
    private curModeIndex: number;

    private curMode: GameMode | undefined;

    constructor(modeFactories: GameModeFactory[]) {
        this.modeFactories = modeFactories;
        this.curModeIndex = 0;
        this.curMode = this.createMode();
    }

    getMode(): GameMode | undefined {
        return this.curMode;
    }

    nextMode(): GameMode | undefined {
        if (this.curModeIndex >= 0 && this.curModeIndex < this.modeFactories.length) {
            this.curModeIndex++;
            this.curMode = this.createMode();
        }

        return this.curMode;
    }

    private createMode(): GameMode | undefined {
        if (this.curModeIndex < 0 || this.curModeIndex >= this.modeFactories.length) {
            return undefined;
        }

        return this.modeFactories[this.curModeIndex]();
    }
}