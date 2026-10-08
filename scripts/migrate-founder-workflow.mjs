import nextEnv from "@next/env";import pg from "pg";import fs from "node:fs/promises";
nextEnv.loadEnvConfig(process.cwd(),true,{info:()=>{},error:()=>{}});
if(!process.env.DATABASE_URI?.startsWith("postgres"))throw new Error("This upgrade requires an existing PostgreSQL Payload schema.");
const db=new pg.Client({connectionString:process.env.DATABASE_URI});await db.connect();
try{await db.query("BEGIN");await db.query("SELECT pg_advisory_xact_lock(610072026)");await db.query(await fs.readFile("docs/migrations/20261007_founder_workflow.sql","utf8"));await db.query("COMMIT");console.log("Founder workflow schema upgrade completed; content and role assignments preserved.");}catch{await db.query("ROLLBACK");throw new Error("Schema upgrade failed and was rolled back; inspect the schema in staging.");}finally{await db.end();}
