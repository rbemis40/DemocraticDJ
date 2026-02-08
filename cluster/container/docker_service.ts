import { GameId } from "../../shared/shared_types";
import { ContainerInfo, ContainerService } from "./container_service";
import * as Docker from "dockerode";

const DOCKER_PATH = process.env.DOCKER_SOCK_PATH;
if (DOCKER_PATH === undefined) {
    throw new Error("Environment var DOCKER_SOCK_PATH not set!");
}

export class DockerService implements ContainerService {
    private docker: Docker;
    constructor() {
        this.docker = new Docker({
            socketPath: DOCKER_PATH
        });
    }

    private async getExposedPortFromImg(imgName: string): Promise<string> {
        const img = this.docker.getImage(imgName);
        const imgInfo = await img.inspect();
        console.log(imgInfo.Config.ExposedPorts);
        const exposedPorts = Object.keys(imgInfo.Config.ExposedPorts)
        if (exposedPorts.length < 1) {
            throw new Error(`Found no exposed ports for image "${imgName}"!`);
        }

        return exposedPorts[0];
    }

    async startContainer(imgName: string, envVars: Record<string, string>): Promise<ContainerInfo> {
        const exposedPortStr = await this.getExposedPortFromImg(imgName);

        const envArray: string[] = Object.keys(envVars).reduce((curArray, key) => {
            curArray.push(`${key}=${envVars[key]}`);
            return curArray;
        }, [] as string[]);

        const container = await this.docker.createContainer({
            Image: imgName,
            Env: envArray,
            HostConfig: {
                PortBindings: {
                    [exposedPortStr]: null
                }
            }
        })
        await container.start();
        const info = await container.inspect();
        
        // Find the port used for any address (0.0.0.0)
        console.log(info.NetworkSettings.Ports);
        const portInfo = info.NetworkSettings.Ports[exposedPortStr];
        if (portInfo === undefined) {
            throw new Error(`Started container had no exposed port matching "${exposedPortStr}"`);
        }

        for (const ipPortPair of portInfo) {
            if (ipPortPair.HostIp === "0.0.0.0") {
                return {
                    port: Number.parseInt(ipPortPair.HostPort, 10),
                    id: info.Id
                };
            }
        }

        throw new Error(`Found no pair entry for 0.0.0.0!`);
    }

    async onContainerStop(id: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const container = this.docker.getContainer(id);
            const res = await container.wait();
            resolve(id);
        });
    }

    deleteContainer(id: string) {
        const container = this.docker.getContainer(id);
        container.kill({
            force: true
        })
    }
}