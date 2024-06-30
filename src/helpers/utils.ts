import ShortUniqueId from 'short-unique-id';

export function generateId(length?: number) {
  const uid = new ShortUniqueId({ length: length ? length : 10 });
  return uid.rnd();
}

export const walletToLowercase = (wallet: string) => {
  return wallet.toLowerCase();
};

export const cleanString = (inputString: string) => {
  const cleanedString = inputString.replace(/[^a-zA-Z0-9\s.]/g, '');
  return cleanedString;
};

export const isObjectEmpty = (obj: Object) => {
  return Object.keys(obj).length === 0;
};

export const stringifySafe = (obj: any): string => {
  const cache = new WeakSet();

  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // Circular reference found, omit it
        return '[Circular]';
      }
      // Store the value in our set
      cache.add(value);
    }
    return value;
  });
};

export const protocol = process.env.NODE_ENV === 'dev' ? 'http' : 'https';

export const timestampToDate = (time: string | number) => {
  const date = new Date(Number(time) * 1000);
  return date;
};
