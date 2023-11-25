export interface ITokenBase {
    iat: number;
    exp: number;
    sub: string;
    iss: string;
    aud: string;
}