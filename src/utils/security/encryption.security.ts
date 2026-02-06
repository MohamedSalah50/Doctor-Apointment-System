import crypto from "crypto-js";

export const generateEncryption = async ({
    plainText = "",
    secretKey = process.env.ENC_SECRET_KEY as string,
} = {}) => {
    return crypto.AES.encrypt(plainText, secretKey).toString();
};

export const decryptEncryption = async ({
    cipherText = "",
    secretKey = process.env.ENC_SECRET_KEY as string,
} = {}) => {
    return crypto.AES.decrypt(cipherText, secretKey).toString(crypto.enc.Utf8);
};