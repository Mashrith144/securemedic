import { randomBytes } from 'crypto';

const secret = randomBytes(64).toString('base64');
console.table({ secret });
