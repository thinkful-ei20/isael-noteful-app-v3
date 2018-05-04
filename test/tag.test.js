
'use strict';
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');
const { Note } = require('../models/note');
const { Folder } = require('../models/folder');
const { Tag } = require('../models/tag');
const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');
const expect = chai.expect;
chai.use(chaiHttp);


describe('Tags Api', function (){
  before(function(){
    return mongoose.connect(TEST_MONGODB_URI);
  });

  beforeEach(function(){
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders),
      Tag.insertMany(seedTags)
    ])
      .then(() => {
        Note.createIndexes();
        Tag.createIndexes();
      });
  });

  afterEach(function(){
    return mongoose.connection.db.dropDatabase();
  });

  after(function(){
    return mongoose.disconnect();
  });

  describe('Get Tags /api/tags', function(){
    it('should return all the tags from the db', function(){
      return Promise.all([
        Tag.find(),
        chai.request(app).get('/api/tags')
      ])
        .then(([db, res])=> {
          expect(res.body).to.be.a('array');
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(db.length).to.equal(res.body.length);
        });
    });
    it('should check if it has the correct keys', function(){
      return chai.request(app).get('/api/tags')
        .then(res => {
          res.body.forEach(tag => {
            expect(tag).to.be.a('object');
            expect(tag).to.have.keys(['_id', 'name', 'createdAt', 'updatedAt', '__v']);
          });
        });
    });
  });

  describe('Get tags by id', function(){
    it('should return a tag if passed in with a valid id', function(){
      let data; 
      return Tag.findOne()
        .then(res => {
          data = res;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.keys(['_id', 'name', 'createdAt', 'updatedAt', '__v']);
        });
    });

    it.only('should return a 404 if id is valid but not in db', function(){
      return chai.request(app).get('/api/tags/222222222222222222222209')
        .then(res => {
          expect(res).to.have.status(404);
          expect(res).to.be.json;
          expect(res.body.message).to.equal('id Not found in db');
          return Tag.findById('222222222222222222222209');
        })
        .then(res => {
          expect(res).throw;
        });
    });

    it('should return a 400 if id is not valid', function(){
      return chai.request(app).get('/api/tags/dsadsa')
        .then(res => {
          expect(res).status(400);
          expect(res).to.be.json;
          expect(res.body.message).to.equal('invalid id');
        });
    });
  });

  it('should only return a true', function (){
    return  Folder.findOne().then((res) => console.log(res));
  });
});