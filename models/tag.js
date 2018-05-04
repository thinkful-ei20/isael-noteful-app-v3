'use strict';

const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
  name: {type: String, unique: true, required: true}
},{timestamps: true});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = { Tag };