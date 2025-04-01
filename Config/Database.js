import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST || 'localhost',
      user: process.env.MYSQLUSER || 'root',
      password: process.env.MYSQL_ROOT_PASSWORD || '',
      database: process.env.MYSQLDATABASE || 'resume_builder'
    });

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content JSON NOT NULL,
        template VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS cover_letters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database connected and tables initialized');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default await createConnection();