CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plants (
    plant_id SERIAL PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    last_watered TIMESTAMP,
    needs_watering BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS sensor_data (
    sensor_data_id SERIAL PRIMARY KEY,
    plant_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperature FLOAT,
    soil_moisture FLOAT,
    other_params JSON,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);

CREATE TABLE IF NOT EXISTS watering_schedules (
    schedule_id SERIAL PRIMARY KEY,
    plant_id INT,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    frequency_days INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);

CREATE TABLE IF NOT EXISTS watering_events (
    event_id SERIAL PRIMARY KEY,
    plant_id INT,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INT NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);

ALTER TABLE sensor_data
DROP CONSTRAINT sensor_data_plant_id_fkey,
ADD CONSTRAINT sensor_data_plant_id_fkey
FOREIGN KEY (plant_id)
REFERENCES plants (plant_id)
ON DELETE CASCADE;

ALTER TABLE watering_schedules
DROP CONSTRAINT watering_schedules_plant_id_fkey,
ADD CONSTRAINT watering_schedules_plant_id_fkey
FOREIGN KEY (plant_id)
REFERENCES plants (plant_id)
ON DELETE CASCADE;

ALTER TABLE watering_events
DROP CONSTRAINT watering_events_plant_id_fkey,
ADD CONSTRAINT watering_events_plant_id_fkey
FOREIGN KEY (plant_id)
REFERENCES plants (plant_id)
ON DELETE CASCADE;
