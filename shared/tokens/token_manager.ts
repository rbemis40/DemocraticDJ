import * as jwt from "jsonwebtoken";

type Token = string;

export interface TokenManager<RoleData> {
    generateToken(role: RoleData): Token;
    exchangeToken(token: Token): RoleData | undefined;
}

type JWTAlg = "HS256";

export class JWTTokenManager<RoleData extends object> implements TokenManager<RoleData> {
    private jwtSecret: string;
    private alg: JWTAlg;

    constructor(jwtSecret: string, alg: JWTAlg) {
        this.jwtSecret = jwtSecret;
        this.alg = alg;
    }

    generateToken(role: RoleData): Token {
        return jwt.sign(role, this.jwtSecret, {
            algorithm: this.alg
        })
    }

    exchangeToken(token: Token): RoleData | undefined {
        try {
            const data: RoleData = jwt.verify(token, this.jwtSecret, {
                algorithms: [this.alg]
            }) as RoleData; // TODO: Add some kind of validation before blindly returning

            return data;
        }
        catch {
            return undefined;
        }
    }

}