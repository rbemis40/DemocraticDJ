import { UserToken } from "../shared_types";
import { randomBytes } from "crypto";

type HostTokenData = {
    isHost: true;
};

type UserTokenData = {
    isHost: false,
    username: string;
};

export type TokenData = HostTokenData | UserTokenData;

/**
 * Responsible for issuing / managing tokens, and exchanging them for user data.
 * This could connect to some form of database so that game servers could verify tokens
 * despite different servers.
 * @static
 */
export class TokenHandler { 
    private static unclaimedTokens:  Map<UserToken, TokenData>;
    static tokenLen: number = 36;

    /**
     * Generates a new token that can be exchanged later for the user data.
     * This could be used to store the token and data in a more robust solutions,
     * such as a proper database.
     * @param tokenData - Basic user data that will be stored until claimed later
     * @throws (Error) - Thrown when the token data is not for a host, but no username is provided
     */
    static generateToken(tokenData: TokenData): UserToken {
        if (!tokenData.isHost && tokenData.username === undefined) {
            throw new Error(`A non-host TokenData must contain a username`);
        }

        let userToken;
        do {
            userToken = randomBytes(TokenHandler.tokenLen).toString('base64');
        } while (this.unclaimedTokens.has(userToken));

        this.unclaimedTokens.set(userToken, tokenData);
        return userToken;
    }

    /**
     * Exchanges a previously generated token for the associated token/user data.
     * @param token - A previously generated UserToken
     * @throws (Error) - If the provided token is not a previously generated and unclaimed token
     */
    static exchangeToken(token: UserToken): TokenData {
        const tokenData = this.unclaimedTokens.get(token);
        if (tokenData === undefined) {
            throw new Error(`Attempt to exchange invalid token '${token}'`);
        }

        return tokenData;
    }
}