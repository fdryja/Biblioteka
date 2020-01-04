const express = require("express");
const app = express();

const bookRoutes = require('./api/routes/books');
const rentRoutes = require('./api/routes/rents');

app.use('/books', bookRoutes);
app.use('/rents', rentRoutes);


module.exports = app;