require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../app');
const { connectDB } = require('../config/db');

const PORT = 3001; // Use a different port for testing

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      
      // Test the endpoint
      const http = require('http');
      const postData = JSON.stringify({ identifier: 'hnkakim@gmail.com', password: 'TempPassword123!' });
      
      const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS:`, res.headers);
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          console.log(`BODY: ${body}`);
          server.close();
          mongoose.disconnect();
          process.exit(0);
        });
      });
      
      req.on('error', (err) => {
        console.error('Request error:', err);
        server.close();
        mongoose.disconnect();
        process.exit(1);
      });
      
      req.write(postData);
      req.end();
    });
  })
  .catch((err) => {
    console.error('DB connection error:', err);
    process.exit(1);
  });
