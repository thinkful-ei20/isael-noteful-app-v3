'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Tag } = require('../models/tag');
const { Note } = require('../models/note');

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
  const { name } = req.body;

  if(!name){
    const err = new Error('missing name');
    err.status = 400;
    return next(err);
  }
  
  const obj = {name};

  Tag.create(obj)
    .then(results =>{
      res.json(results);
    })
    .catch(error => {
      if(error.code === 11000){
        const err = new Error('Cannot create. Duplicate name');
        err.status = 400;
        next(err);
      }
    });

});

router.put('/:id', (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('Id is not valid');
    err.status = 400;
    next(err);
  }

  if(!name){
    const err = new Error('missing name');
    err.status = 400;
    next(err);
  }

  const obj = {name};

  Tag.findByIdAndUpdate(id, obj, {new: true})
    .then(results => {
      if(results === null){
        const err = new Error('id not found in db');
        err.status = 404;
        next(err);
      }else{
        res.json(results);        
      }
    })
    .catch(error => {
      if(error.code === 11000){
        const err = new Error('Cannot create. Duplicate name');
        err.status = 400;
        next(err);
      }
    });

});

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  const tagRemovePromise = Tag.findByIdAndRemove(
    { _id: id }
  );
  const noteUpdatePromise = Note.updateMany({ 'tags': id }, { '$pull': { 'tags': id } }
  );

  Promise.all([tagRemovePromise, noteUpdatePromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;