import { GameMode } from "../modes/game_mode.js";
import { ModeSequence, ModeSequenceFactory } from "./mode_sequence.js";


export class GameModeSequencer {
    private sequenceFactories: ModeSequenceFactory[];
    private curSeqIndex: number;

    private curSequence: ModeSequence;
    private curMode: GameMode;

    constructor(sequenceFactories: ModeSequenceFactory[]) {
        this.sequenceFactories = sequenceFactories;
        this.curSeqIndex = 0;
        this.curSequence = this.createSequence();
        this.curMode = this.getCurModeInSequence();
    }

    getCurrentMode(): GameMode {
        return this.curMode;
    }

    nextMode() {
        let nextMode: GameMode | undefined = this.curSequence.nextMode();
        if (nextMode === undefined) {
            this.nextSequence();
        }

        this.curMode = this.getCurModeInSequence();
    }

    private nextSequence() {
        this.curSeqIndex = (this.curSeqIndex + 1) % this.sequenceFactories.length; // If we reach the end, wrap around to the start
        this.curSequence = this.createSequence();
    }

    private createSequence(): ModeSequence {
        return this.sequenceFactories[this.curSeqIndex]();
    }

    private getCurModeInSequence(): GameMode {
        const mode = this.curSequence.getMode();
        if (mode === undefined) {
            throw new Error(`Current sequence game mode is undefined, at sequence index ${this.curSeqIndex}`);
        }

        return mode;
    }
}