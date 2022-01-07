const fs = require('fs'); // allow new info to be written to local files
const path = require('path'); // a module built into the Node.js API that provides utilities for working with file and directory paths. It ultimately makes working with our file system a little more predictable, especially when we work with production environments such as Heroku.
const express = require("express"); // require express.js with npm package
const PORT = process.env.PORT || 3001;
const app = express(); // Instantiate the server
const { animals } = require("./data/animals.json");
const res = require('express/lib/response');

// In order for our server to accept incoming data the way we need it to, we need to tell our Express.js app to intercept our POST request before it gets to the callback function. At that point, the data will be run through a couple of functions to take the raw data transferred over HTTP and convert it to a JSON object.
// parse incoming string or array data with express.urlencoded method
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data with express.json method
app.use(express.json());
// middleware that instructs the server to make the files in public folder available and not to gate it behind a server endpoint. 
app.use(express.static('public'));

function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  // Note that we save the animalsArray as filteredResults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
    // Save personalityTraits as a dedicated array.
    // If personalityTraits is a string, place it into a new array and save.
    if (typeof query.personalityTraits === "string") {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach((trait) => {
      // Check the trait against each animal in the filteredResults array.
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop.
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one
      // of the traits when the .forEach() loop is finished.
      filteredResults = filteredResults.filter(
        (animal) => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(
      (animal) => animal.diet === query.diet
    );
  }
  if (query.species) {
    filteredResults = filteredResults.filter(
      (animal) => animal.species === query.species
    );
  }
  if (query.name) {
    filteredResults = filteredResults.filter(
      (animal) => animal.name === query.name
    );
  }
  // return the filtered results:
  return filteredResults;
}

function findById(id, animalsArray) {
  const result = animalsArray.filter((animal) => animal.id === id)[0];
  return result;
}

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);

    // take new array with new animal added and write it to animals.json file
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    //return finished code to POST route for response
    return animal;
    console.log(animal)
} 

// returns array of all animals that match query (filterByQuery)
app.get("/api/animals", (req, res) => {
  let results = animals;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});

// return one specific animal that matches parameter
app.get("/api/animals/:id", (req, res) => {
  const result = findById(req.params.id, animals);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});

app.post('/api/animals', (req, res) => { // post is a method of the app object. A post request represents the action of a client requesting the server to accept data, rather than sending data (like the get method)
    
    // set id based on waht the next index of the array will be
    req.body.id = animals.length.toString();
    // if any data in req.body is incorrect, send 400 error back 
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
        const animal = createNewAnimal(req.body, animals)
        res.json(animal);
    }
});


function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
      return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
      return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
      return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
      return false;
    }
    return true;
  }

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/animals', (req,res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
});

app.get('/zookeepers', (req,res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});
// if user chooses a route that doesnt exist the * will automatically route them back to homepage
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
  });

app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`); // Add the listen method to make server listen
});
