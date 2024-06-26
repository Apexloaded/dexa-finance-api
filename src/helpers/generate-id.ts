import { customRandom, customAlphabet, random } from 'nanoid';

export const tokenNumeric = '1234567890';
export const lowerAlphabet = 'abcdefghijklnmopqrstuvwxyz';
export const lowerTokenAlphaNumeric = `${tokenNumeric}${lowerAlphabet}`;
export const upperTokenAlphaNumeric = `${tokenNumeric}${lowerAlphabet.toUpperCase()}`;

export function generateToken(type: string, length: number, isRand?: boolean) {
  let nanoid;
  if (!isRand) {
    nanoid = customAlphabet(type, length);
    return nanoid();
  }
  nanoid = customRandom(type, length, random);
  return nanoid();
}
