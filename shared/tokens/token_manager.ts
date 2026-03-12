import jwt from "jsonwebtoken";

type Token = string;

export interface TokenManager {
    generateToken<RoleData extends object>(role: RoleData): Token;
    exchangeToken<RoleData extends object>(token: Token): RoleData | undefined;
}

type JWTAlg = "HS256";

export class JWTTokenManager implements TokenManager {
    private jwtSecret: string;
    private alg: JWTAlg;

    constructor(jwtSecret: string, alg: JWTAlg) {
        this.jwtSecret = jwtSecret;
        this.alg = alg;
    }

    generateToken<RoleData extends object>(role: RoleData): Token {
        return jwt.sign(role, this.jwtSecret, {
            algorithm: this.alg
        })
    }

    exchangeToken<RoleData extends object>(token: Token): RoleData | undefined {
        try {
            const data: RoleData = jwt.verify(token, this.jwtSecret, {
                algorithms: [this.alg]
            }) as RoleData; // TODO: Add some kind of validation before blindly returning

            return data;
        }
        catch(err) {
            console.warn(err);
            return undefined;
        }
    }

}