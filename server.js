const express = require("express"); // require express.js with npm package
const PORT = process.env.PORT || 3001;
const app = express(); // Instantiate the server
const { animals } = require("./data/animals.json");
const apiRoutes = require('./routes/apiRoutes');
const htmlRoutes = require('./routes/htmlRoutes');

// In order for our server to accept incoming data the way we need it to, we need to tell our Express.js app to intercept our POST request before it gets to the callback function. At that point, the data will be run through a couple of functions to take the raw data transferred over HTTP and convert it to a JSON object.
// parse incoming string or array data with express.urlencoded method
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data with express.json method
app.use(express.json());
// middleware that instructs the server to make the files in public folder available and not to gate it behind a server endpoint. 
app.use(express.static('public'));

// Use APiRoutes
app.use('/api', apiRoutes);
app.use('/', htmlRoutes);

app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`); // Add the listen method to make server listen
});
