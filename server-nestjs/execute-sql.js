const { Client } = require('pg');

async function main() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const connectionString = "postgresql://postgres.xmvbykljzjeeikzzezdl:UW7kHOTIMr3L6liK@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"; // Using the CORRECT PgBouncer URL
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
  });

  try {
    await client.connect();
    console.log("Connected to database. Executing SQL...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Offer" (
          "id"          SERIAL PRIMARY KEY,
          "userId"      INTEGER NOT NULL REFERENCES "User"("id"),
          "title"       TEXT NOT NULL,
          "content"     TEXT NOT NULL,
          "image"       TEXT,
          "isPermanent" BOOLEAN NOT NULL DEFAULT true,
          "startDate"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "endDate"     TIMESTAMP(3),
          "isActive"    BOOLEAN NOT NULL DEFAULT true,
          "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Offer table created.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "OfferLike" (
          "id"        SERIAL PRIMARY KEY,
          "offerId"   INTEGER NOT NULL REFERENCES "Offer"("id") ON DELETE CASCADE,
          "patientId" INTEGER REFERENCES "Patient"("id"),
          "userId"    INTEGER REFERENCES "User"("id"),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE ("offerId", "patientId"),
          UNIQUE ("offerId", "userId")
      );
    `);
    console.log("✅ OfferLike table created.");

  } catch (err) {
    console.error("❌ Error executing SQL:", err);
  } finally {
    await client.end();
    console.log("Connection closed.");
  }
}

main();
