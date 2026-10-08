import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });
import { getPayload } from 'payload';
import config from '../src/payload.config.ts';

const payload = await getPayload({ config });
const users = await payload.find({ collection: 'users', overrideAccess: true });
console.log('USERS COUNT:', users.totalDocs);
console.log('USERS:', users.docs.map(u => ({ id: u.id, email: u.email, role: u.role, name: u.name })));
await payload.destroy();
process.exit(0);
