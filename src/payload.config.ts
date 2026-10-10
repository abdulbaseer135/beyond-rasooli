import { cmsEmail } from "./lib/cms-email";
import { Authors } from "./collections/Authors";
import { Glossary } from "./collections/Glossary";
import { en } from "@payloadcms/translations/languages/en";
import { fa } from "@payloadcms/translations/languages/fa";
import {SlugRedirects} from './collections/SlugRedirects';
import {TranslationUsage} from './collections/TranslationUsage';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import { horizontalRuleFeature } from './lib/editor-horizontal-rule';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Articles } from './collections/Articles';
import { Videos } from './collections/Videos';
import { Topics } from './collections/Topics';
import { Collections } from './collections/Collections';
import { Pages } from './collections/Pages';
import { UIStrings } from './collections/UIStrings';
import { Contacts } from './collections/Contacts';
import { Notifications } from './collections/Notifications';
import { SiteSettings } from './globals/SiteSettings';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
if (process.env.NODE_ENV === 'production' && process.env.BEYOND_QA !== 'true' && (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32 || /dev-secret|change-in-production/.test(process.env.PAYLOAD_SECRET))) throw new Error('A production-safe PAYLOAD_SECRET is required.');

// Database Adapter: Postgres in production/staging; SQLite for zero-dependency local dev
const databaseUri = process.env.DATABASE_URI || 'file:./data/beyond_rasooli.sqlite';
const isPostgres = databaseUri.startsWith('postgres');

const dbAdapter = isPostgres
  ? postgresAdapter({
      pool: {
        connectionString: databaseUri,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      },
      push: false,
    })
  : sqliteAdapter({
      client: {
        url: databaseUri,
      },
      push: process.env.BEYOND_QA === 'true' ? process.env.QA_SCHEMA_SETUP === 'true' : undefined,
    });

import sharp from 'sharp';

const publicOrigin = process.env.BEYOND_QA === 'true' ? 'http://localhost:3100' : new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').origin;
export default buildConfig({
  csrf: [publicOrigin, ...(process.env.BEYOND_QA === 'true' ? ['http://localhost:3100'] : [])],
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname, '..'), importMapFile: path.resolve(dirname, 'app/(payload)/admin/importMap.js') },
    components: {
      actions: ['/src/components/admin/NotificationBell#NotificationBell'],
      beforeNavLinks: ['/src/components/admin/QuickAdd#QuickAdd'],
      graphics: { Logo: '/src/components/admin/Brand#Logo', Icon: '/src/components/admin/Brand#Icon' },
      afterLogin: ['/src/components/admin/LoginFooter#LoginFooter'],
    },
    meta: {titleSuffix:' | Beyond Rasooli'},
    theme: 'light',
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en, fa },
    translations: {
      en: {
        general: {
          welcome: 'Create Founder Account',
        },
        authentication: {
          beginCreateFirstUser: 'Set up the initial administrator credentials for Beyond Rasooli.',
        },
      },
      fa: {
        general: {
          welcome: 'ایجاد حساب کاربری بنیانگذار',
        },
        authentication: {
          beginCreateFirstUser: 'تنظیم اطلاعات اولیه مدیر برای Beyond Rasooli.',
        },
      },
    },
  },
  sharp,
  email: cmsEmail,
  collections: [
    Users,
    Authors,
    Glossary,
    Media,
    Articles,
    Videos,
    Topics,
    Collections,
    Pages,
    UIStrings,
    Contacts,
    Notifications,
    TranslationUsage,
    SlugRedirects,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor({features:({defaultFeatures})=>[...defaultFeatures.map(feature => feature.key === 'horizontalRule' ? horizontalRuleFeature() : feature),BlocksFeature({blocks:[{slug:'pullQuote',fields:[{name:'quote',type:'textarea',required:true},{name:'attribution',type:'text'}]},{slug:'evidenceNote',fields:[{name:'status',type:'select',required:true,options:['established','emerging','debated']},{name:'text',type:'textarea',required:true}]},{slug:'part',fields:[{name:'partNumber',type:'number',required:true,min:1},{name:'title',type:'text',required:true}]},{slug:'video',fields:[{name:'youtubeUrl',type:'text',required:true},{name:'title',type:'text',required:true}]}]})]}),
  secret: process.env.PAYLOAD_SECRET || 'beyond-rasooli-dev-secret-32-chars-long-abc-xyz',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: dbAdapter,
  localization: {
    locales: ['ps', 'fa', 'en'],
    defaultLocale: 'ps',
    fallback: true,
  },
});
