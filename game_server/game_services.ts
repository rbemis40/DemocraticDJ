import { Player } from "./player.js";

export type RemovePlayerService = (player: Player) => void;
export type NextModeService = () => void;