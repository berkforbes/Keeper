const router = require('express').Router();
const { filterByQuery, findById, createNewAnimal, validateAnimal } = require('../../lib/animals');
const { animals } = require('../../data/animals');

// returns array of all animals that match query (filterByQuery)
router.get("/animals", (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });
  
  // return one specific animal that matches parameter
  router.get("/animals/:id", (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
      res.json(result);
    } else {
      res.send(404);
    }
  });

  router.post('/animals', (req, res) => { // post is a method of the router object. A post request represents the action of a client requesting the server to accept data, rather than sending data (like the get method)=
    // set id based on waht the next index of the array will be
    req.body.id = animals.length.toString(); 
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
        const animal = createNewAnimal(req.body, animals)
        res.json(animal);
    }
});

module.exports  = router;