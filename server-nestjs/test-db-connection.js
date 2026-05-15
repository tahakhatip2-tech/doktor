const { Client } = require('pg');

async function testConnection(connectionString) {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected successfully to', connectionString.replace(/:[^:@]+@/, ':***@'));
    await client.end();
  } catch (error) {
    console.error('Failed to connect to', connectionString.replace(/:[^:@]+@/, ':***@'));
    console.error(error.message);
  }
}

async function main() {
  const passwords = ['UW7kHOTIMr3L6liK'];
  const usernames = ['postgres.xmvbykljzjeeikzzezdl', 'postgres'];
  const hosts = [
    'aws-0-eu-west-1.pooler.supabase.com:6543',
    'aws-0-eu-west-1.pooler.supabase.com:5432'
  ];

  for (const host of hosts) {
    for (const username of usernames) {
      const url = `postgresql://${username}:${passwords[0]}@${host}/postgres`;
      await testConnection(url);
    }
  }
}

main();
