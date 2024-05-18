const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./lib/db.js');
const errorMiddleware = require('./middlewares/errorMiddleware.js');
const { manageUserRouter } = require('./routers/manageUsers.js');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
dotenv.config();

// required middlewares
app.use(cors({
    origin: true, 
    credentials: true
}));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, 'uploads')))

// connect to MongoDB
connectDB();

// Proxy route for unsubscribe
// app.use('/unsubscribe/:id', createProxyMiddleware({
//     target: 'http://localhost:5001',
//     changeOrigin: true,
//     pathRewrite: (path, req) => {
//         // Rewrites '/unsubscribe/:id' to '/api/v1/unsubscribe/:id'
//         return path.replace('/unsubscribe', '/api/v1/unsubscribe');
//     },
//     onProxyReq: (proxyReq, req, res) => {
//         // Modify headers or other proxyReq properties if needed
//     },
//     onProxyRes: (proxyRes, req, res) => {
//         // Handle proxy response if needed
//     }
// }));

// routing middleware
app.use(manageUserRouter);

app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, (err) => {
    if (err) throw err
    console.log(`Server started on port ${port}`);
});