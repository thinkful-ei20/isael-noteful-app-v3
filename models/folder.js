'use strict';
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const folderSchema = schema({
  name:{type: String, unique:true, required: true},
}, {timestamps: true});

const Folder = mongoose.model('Folder', folderSchema);

module.exports = {Folder};