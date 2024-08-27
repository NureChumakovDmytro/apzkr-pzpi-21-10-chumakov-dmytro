const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'Server_flowers_pod',
    password: '123456',
    port: 5432,
};

const dbName = 'plant_tracker';

async function setupDatabase() {
    const adminClient = new Client(dbConfig);

    try {
        await adminClient.connect();

        // Check if the database exists
        const res = await adminClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbName]
        );

        if (res.rows.length === 0) {
            // Database doesn't exist, create it
            await adminClient.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database ${dbName} created.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }

        await adminClient.end();

        // Connect to the plant_tracker database
        const client = new Client({
            ...dbConfig,
            database: dbName,
        });

        await client.connect();

        // Read and execute the SQL file
        const sqlFile = path.join(__dirname, 'schema.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        // Split the SQL content into individual statements
        const statements = sqlContent.split(';').filter(stmt => stmt.trim() !== '');

        // Execute each statement
        for (let statement of statements) {
            try {
                await client.query(statement);
            } catch (err) {
                console.error('Failed to execute statement:', statement);
                console.error('Error:', err);
            }
        }

        console.log('Database schema created successfully.');

        await client.end();
        console.log('Database setup completed.');
    } catch (err) {
        console.error('An error occurred:', err);
    }
}

module.exports = setupDatabase;
