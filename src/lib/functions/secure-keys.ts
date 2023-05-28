import { AES, enc } from 'crypto-js';
import { ENCRYPTION_KEY } from '../../../config-env';

export const encryptKey = (key) => {
  return AES.encrypt(key, ENCRYPTION_KEY).toString();
};

export const decryptKey = (encryptedKey) => {
  const bytes = AES.decrypt(encryptedKey, ENCRYPTION_KEY);
  return bytes.toString(enc.Utf8);
};