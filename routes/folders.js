'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {Folder} = require('../models/folder');

router.get('/', (req, res, next) => {
  return Folder.find().sort({name: 1})
    .then(result => {
      if(result){
        res.json(result);
      } 
      else{
        next();
      } 
    });
});

router.get('/:id', (req,res, next) => {
  const {id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('the `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Folder.findById(id)
    .then(results => {
      if(results){
        res.json(results);
      }
      else{
        next();
      } 
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const { name } = req.body;
  const obj = {name};

  if(!name){
    const err = new Error('need name');
    err.status = 400;
    return next(err);
  }

  Folder.create(obj)
    .then(results => {
      res.status(201)
        .location(`${req.hostname}${req.originalUrl}/${results.id}`)
        .json(results);
    })
    .catch(error =>{
      if(error.code === 11000){
        const err = new Error('Folder name exists');
        err.status = 400;
        return next(err);
      }
    });

});

router.put('/:id', (req,res,next) => {
  const {id} = req.params;
  const { name } = req.body;

  if(!req.body.name){
    const err = new Error ('need name');
    err.status = 400;
    return next(err);
  }

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('the `id` is not valid');
    err.status = 400;
    return  next(err);
  }

  const obj = {name};

  return Folder.findByIdAndUpdate(id, obj, {new: true})
    .then(results => {
      if(results) res.json(results);
      else next();
    })
    .catch(error => {
      if(error.code === 11000){
        const err = new Error('folder name exists');
        err.status = 400;
        return next(err);
      }
    });
}); 

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  Folder.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(() => {
      const err = new Error('Invalid Id');
      err.status = 400;
      return next(err);
    });
});

module.exports = router;