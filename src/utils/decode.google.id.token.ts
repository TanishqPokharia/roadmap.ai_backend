import { OAuth2Client } from "google-auth-library"
import DataOrError from "./data.or.error";

export type GoogleOAuthInfo = {
    username: string;
    email: string;
    picture: string | null;
    googleId: string;
};
export const decodeGoogleIdToken = async (idToken: string): Promise<DataOrError<GoogleOAuthInfo>> => {
    try {
        const env = process.env;
        const client = new OAuth2Client({
            client_id: env.GOOGLE_CLIENT_ID,
        });

        const ticket = await client.verifyIdToken({
            idToken,
            audience: env.GOOGLE_CLIENT_ID,

        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error("Could not extract payload from google id token");
        }
        const { sub: googleId, name, email, picture } = payload!;
        if (!googleId || !name || !email) {
            throw new Error("Invalid values extracted from google id token");
        }
        return {
            data: {
                username: name,
                email,
                picture: picture ?? null,
                googleId
            },
            error: null
        };
    }
    catch (error) {
        return { error: error as Error, data: null };
    }
}