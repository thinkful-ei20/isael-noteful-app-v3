
'use strict';
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const mongoose = require('mongoose');
//test
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

    it('should return a 404 if id is valid but not in db', function(){
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

  describe('Post tags /api/tags', function(){
    it('should return a new tag if name is if it is valid', function(){
      const obj = {
        name: 'hism'
      };
      let response;
      return chai.request(app).post('/api/tags').send(obj)
        .then(res => {
          response = res;
          expect(res).status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.keys(['_id', 'name', '__v', 'createdAt', 'updatedAt']);
          return Tag.findById(res.body._id);
        })
        .then(res => {
          expect(res.id).to.equal(response.body._id);
          expect(res.name).to.equal(response.body.name);
          expect(new Date(res.createdAt).getTime()).to.equal(new Date(response.body.createdAt).getTime());
          expect(new Date(res.updatedAt).getTime()).to.equal(new Date(response.body.updatedAt).getTime());
        });
    });

    it('should return an error when name is empty', function(){
      let obj = {
        name: ''
      };
      return chai.request(app).post('/api/tags').send(obj)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('missing name');
        }); 
    });

    it('should return an error if the tag already exists when creating tag', function(){
      let obj = {
        name: 'bar'
      };
      return Tag.findOne()
        .then(res => {
          return chai.request(app).put(`/api/tags/${res.id}`).send(obj);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot create. Duplicate name');
        });
    });

  });

  describe('Put tags /api/tags/:id', function(){
    it('should update the tags if given a name with valid id', function(){
      let obj = {
        name: 'isael'
      };
      let data;
      return Tag.findOne()
        .then(res => {
          data = res;

          return chai.request(app).put(`/api/tags/${res.id}`);
        })
        .then(res => {
          console.log(res);
        });
    });

    it('should return an error if the name is empty', function(){
      let obj = {
        name: ''
      };

      return Tag.findOne()
        .then(res => {
          return chai.request(app).put(`/api/tags/${res.id}`).send(obj);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('missing name');
        });
    });

    it('should return a 400 error if the id is not valid', function(){
      let obj = {
        name: 'isael'
      };
      
      return chai.request(app).put('/api/tags/gagdgagda').send(obj)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Id is not valid');
        });
    });

    it('should return a 404 if id is not found in the db', function (){
      let obj = {
        name: 'isael'
      };

      return chai.request(app).put('/api/tags/222222222222222222222100').send(obj)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('id not found in db');
        });
    });

    it('should return an error if the tag already exists when updating name', function(){
      let obj = {
        name: 'bar'
      };
      return Tag.findOne()
        .then(res => {
          return chai.request(app).put(`/api/tags/${res.id}`).send(obj);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Cannot create. Duplicate name');
        });
    });
  });

  describe('Delete tags /api/tags/:id', function(){
    it('should return 204 if the test have been deleted', function(){
      return Tag.findOne()
        .then(res =>{
          return chai.request(app).delete(`/api/tags/${res.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
        });
    });

    // it.only('should remove the tags from all the notes', function(){
    //   let id;
    //   return Tag.findOne()
    //     .then(res => {
    //       console.log(res.id);
    //       id = res.id;
    //       return Note.updateMany({'tags': res.id}, {'$pull' : {'tags': res.id}});
    //     })
    //     .then(res => {
    //       return chai.request(app).get('/api/notes');
    //     })
    //     .then(res => {
    //       console.log(res);
    //       expect(res.body.tags).to.not.include(id);
    //     });
    // });
  });

  it('should only return a true', function (){
    return  Folder.findOne().then((res) => console.log(res));
  });
});