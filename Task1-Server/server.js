const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const setupDatabase = require('./setupDatabase');

// JWT secret
const jwtSecret = 'FUedot2675DFsfvjvhy';

const app = express();
const port = 3001;

// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'plant_tracker',
    password: '123456',
    port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from header

    if (!token) {
        return res.sendStatus(401); // No token provided
    }

    // Use the same secret used to sign the token
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            console.error('JWT Error:', err); // Log specific JWT error
            return res.sendStatus(403); // Invalid token
        }

        req.user = user; // Attach user info to request
        next(); // Proceed to next middleware
    });
}

// New route to fetch admin's name
app.get('/api/admin-name', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Fetch the admin's username from the database
        const result = await pool.query('SELECT username FROM users WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Respond with the username
        res.json({ name: result.rows[0].username });
    } catch (err) {
        console.error('Error fetching admin name:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Registration route
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if the username or email already exists
        const existingUser = await pool.query(
            `SELECT * FROM users WHERE email = $1 OR username = $2`,
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database with hashed password
        const result = await pool.query(
            `INSERT INTO users (username, email, password) 
             VALUES ($1, $2, $3) RETURNING user_id`,
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].user_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user.rows[0].user_id }, jwtSecret, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Password change route
app.post('/api/passwordChange', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Fetch user from the database
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Verify the old password
        const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid old password' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await pool.query(
            'UPDATE users SET password = $1 WHERE username = $2',
            [hashedPassword, username]
        );

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add Plant Route with authentication
app.post('/api/plants', authenticateToken, async (req, res) => {
    const { name, species, location, sensorData, wateringSchedule } = req.body;
    const userId = req.user.userId; // Get the userId from the authenticated token

    if (!name || !species || !sensorData || !wateringSchedule) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert new plant
        const plantResult = await client.query(
            `INSERT INTO plants (user_id, name, species, location) 
             VALUES ($1, $2, $3, $4) RETURNING plant_id`,
            [userId, name, species, location]
        );

        const plantId = plantResult.rows[0].plant_id;

        // Insert initial sensor data
        const { temperature, soil_moisture, other_params } = sensorData;
        await client.query(
            `INSERT INTO sensor_data (plant_id, temperature, soil_moisture, other_params) 
             VALUES ($1, $2, $3, $4)`,
            [plantId, temperature, soil_moisture, other_params]
        );

        // Insert watering schedule
        const { start_time, duration_minutes, frequency_days } = wateringSchedule;
        await client.query(
            `INSERT INTO watering_schedules (plant_id, start_time, duration_minutes, frequency_days) 
             VALUES ($1, $2, $3, $4)`,
            [plantId, start_time, duration_minutes, frequency_days]
        );

        await client.query('COMMIT');

        res.status(201).json({ message: 'Plant created successfully', plantId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// Fetch user's plants
app.get('/api/user-plants', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const plants = await pool.query(
            `SELECT p.*, sd.temperature, sd.soil_moisture, sd.timestamp AS last_sensor_update
             FROM plants p
             LEFT JOIN sensor_data sd ON p.plant_id = sd.plant_id
             WHERE p.user_id = $1
             ORDER BY sd.timestamp DESC`,
            [userId]
        );

        res.json(plants.rows);
    } catch (err) {
        console.error('Error fetching user plants:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Plant Route
app.delete('/api/user-plants/:id', authenticateToken, async (req, res) => {
    const plantId = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(plantId)) {
        return res.status(400).json({ error: 'Invalid plant ID' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if plant exists and belongs to user
        const plantResult = await client.query(
            'SELECT * FROM plants WHERE plant_id = $1 AND user_id = $2',
            [plantId, userId]
        );

        if (plantResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Plant not found or not owned by user' });
        }

        // Delete related sensor data
        await client.query('DELETE FROM sensor_data WHERE plant_id = $1', [plantId]);

        // Delete related watering schedules
        await client.query('DELETE FROM watering_schedules WHERE plant_id = $1', [plantId]);

        // Delete related watering events
        await client.query('DELETE FROM watering_events WHERE plant_id = $1', [plantId]);

        // Delete plant
        await client.query('DELETE FROM plants WHERE plant_id = $1', [plantId]);

        await client.query('COMMIT');

        res.status(200).json({ message: 'Plant deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting plant:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// Update Plant Route
app.put('/api/plants/:id', authenticateToken, async (req, res) => {
    const plantId = parseInt(req.params.id);
    const userId = req.user.userId; // Get the userId from the authenticated token
    const { name, species, location, sensorData, wateringSchedule } = req.body;

    if (!name || !species || !sensorData || !wateringSchedule) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (isNaN(plantId)) {
        return res.status(400).json({ error: 'Invalid plant ID' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if plant exists and belongs to user
        const plantResult = await client.query(
            'SELECT * FROM plants WHERE plant_id = $1 AND user_id = $2',
            [plantId, userId]
        );

        if (plantResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Plant not found or not owned by user' });
        }

        // Update plant details
        await client.query(
            `UPDATE plants 
             SET name = $1, species = $2, location = $3 
             WHERE plant_id = $4 AND user_id = $5`,
            [name, species, location, plantId, userId]
        );

        // Update sensor data
        const { temperature, soil_moisture, other_params } = sensorData;
        await client.query(
            `UPDATE sensor_data 
             SET temperature = $1, soil_moisture = $2, other_params = $3 
             WHERE plant_id = $4`,
            [temperature, soil_moisture, other_params, plantId]
        );

        // Update watering schedule
        const { start_time, duration_minutes, frequency_days } = wateringSchedule;
        await client.query(
            `UPDATE watering_schedules 
             SET start_time = $1, duration_minutes = $2, frequency_days = $3 
             WHERE plant_id = $4`,
            [start_time, duration_minutes, frequency_days, plantId]
        );

        await client.query('COMMIT');

        res.status(200).json({ message: 'Plant updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating plant:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// Start server after database setup
setupDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to set up database:', err);
});
