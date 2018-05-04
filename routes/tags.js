'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Tag } = require('../models/tag');

router.get('/', (req, res, next) => {
  Tag.find()
    .then(results => {
      if(results){
        res.json(results);
      }else{
        next();
      }
    });
});

router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('invalid id');
    err.status = 400;
    next(err);
  }

  Tag.findById(id)
    .then(results => {
      if(results === null) {
        const err = new Error('id Not found in db');
        err.status = 404;
        next(err);
      }else{
        res.json(results);
      }
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  
});

module.exports = router;