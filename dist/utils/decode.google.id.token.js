"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeGoogleIdToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const decodeGoogleIdToken = async (idToken) => {
    try {
        const env = process.env;
        const client = new google_auth_library_1.OAuth2Client({
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
        const { sub: googleId, name, email, picture } = payload;
        if (!googleId || !name || !email) {
            throw new Error("Invalid values extracted from google id token");
        }
        return {
            data: {
                username: name,
                email,
                picture: picture !== null && picture !== void 0 ? picture : null,
                googleId
            },
            error: null
        };
    }
    catch (error) {
        return { error: error, data: null };
    }
};
exports.decodeGoogleIdToken = decodeGoogleIdToken;
