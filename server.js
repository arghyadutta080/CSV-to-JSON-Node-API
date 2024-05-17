const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./lib/db.js');
const errorMiddleware = require('./middlewares/errorMiddleware.js');
const { manageUserRouter } = require('./routers/manageUsers.js');
const path = require('path');

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

// routing middleware
app.use(manageUserRouter);

app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, (err) => {
    if (err) throw err
    console.log(`Server started on port ${port}`);
});