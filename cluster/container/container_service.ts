import { GameId } from "../../shared/shared_types";

export interface ContainerService {
    /**
     * Starts a game container with the appropriate game id
     * @param gameId 
     * @param spotifyCode
     * @param gameServerImgName
     * @returns number - The port that the game server was started on
     */
    startContainer(imgName: string, envVars: Record<string, string>): Promise<ContainerInfo>;

    /**
     * Returns a promise which resolves with the container id once the container has been stopped.
     * @param id - The container id
     */
    onContainerStop(id: string): Promise<string>;

    /**
     * Deletes a container
     * @param id - The container id
     */
    deleteContainer(id: string): void;
}

//export type ContainerStatus = "running" | "stopped";

export interface ContainerInfo {
    port: number;
    id: string;
}