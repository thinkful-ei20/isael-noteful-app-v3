'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//mongoose.Promise = global.Promise;

const {Note} = require('../models/note');
/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {
  const {searchTerm, folderId} = req.query;

  let filter = {};
  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{'title': {$regex: re}}, {'content': {$regex: re}}];
  }

  if(folderId){
    filter.folderId = folderId;
  }
  

  Note.find(filter)//!findCond ? {} : findCond
    .sort('created')
    .then(results => {
      res.json(results);
    })

    .catch(err => {
      next(err);
    });


});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const {folderId, title, content} = req.body;
  const obj = {title, content};

  if(mongoose.Types.ObjectId.isValid(folderId)){
    obj.folderId = folderId;
  }

  if(!obj.title){
    const err = new Error('You need a title');
    err.status = 400;
    return next(err);
  }

  Note.create(obj)
    .then(results => {
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
    })
    .catch((err) => next(err));

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const {title, content, folderId} = req.body;
  const obj = {title};

  if(content) obj.content = content;

  if(mongoose.Types.ObjectId.isValid(folderId)){
    obj.folderId = folderId;
  }
  
  if(!obj.title){
    const err = new Error('You need a title');
    err.status = 400;
    return next(err);
  }
  
  Note.findByIdAndUpdate(id, obj, {new: true})
    .then(results => {
      res.json(results);
    })
    .catch(() => {
      const err = new Error('Invalid Id');
      err.status = 400;
      return next(err);
    });
  
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  Note.findByIdAndRemove(id)
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