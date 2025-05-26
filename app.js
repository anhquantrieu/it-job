const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const routes = require('./routes');
require("./utils/cloudinary");
dotenv.config();
connectDB();


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(routes);
app.get('/', (req, res) => res.send('Server is running'));

module.exports = app;
