'use strict';
//comment

const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const app = require('../server');

const { TEST_MONGODB_URI } = require('../config');
const { Note } = require('../models/note');
const { Folder } = require('../models/folder');
const seedFolders = require('../db/seed/folders');
const seedNotes = require('../db/seed/notes');
const expect = chai.expect;
chai.use(chaiHttp);



describe('note api', function(){
  before(function (){
    return mongoose.connect(TEST_MONGODB_URI);
  });
  
  beforeEach(function (){
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders)
    ])
      .then(() => Note.createIndexes());
  });
  
  afterEach(function (){
    return mongoose.connection.db.dropDatabase();
  });
  
  after(function(){
    return mongoose.disconnect();
  });

  describe('GET /api/notes/:id', function () {
    it('should return correct note', function () {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app)
            .get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
  
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');
  
          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });
    it('should return 400 bad id', function(){
      const id = 'dsadsadasdasdasdas';
      return Promise.all([
        Note.find({id: id}),
        chai.request(app).get(`/api/notes/${id}`)
      ])
        .then(([data,res]) =>{
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
          expect(data).to.throw;
        });
    });
    // it.only('should return an error if id does not exist', function(){
    //   let data;
      
    //   return Note.findOne()
    //     .then(_data => {
          
  
    //       return chai.request(app)
    //         .get(`/api/notes/${data.id}1`);
    //     })
    //     .then( (res) => {
    //       expect(res)
    //     });
    // });
  });
  
  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };
  
      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'tags');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });

    it('should get an error of 400 saying you need a title', function(){
      const newItem = {
        'titdasle': 'The best article about cats ever!',
      };
  
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('You need a title');
          // 2) then call the database
        });
    });

  });
  
  describe('GET /api/notes', function () {
    // 1) Call the database **and** the API
    // 2) Wait for both promises to resolve using `Promise.all`
  
    it('should return all notes', function(){
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should check if each note have correct keys', function(){
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(note => {
            expect(note).to.be.a('object');
            expect(note).to.have.keys('title', 'createdAt', 'updatedAt', 'id', 'folderId', 'content', 'tags');
          });
        });
    });

    it('should return notes on searchTerm', function(){
      let searchTerm = '10';
      const re = new RegExp(searchTerm, 'i');
      return Promise.all([
        Note.find({$or: [{title: re},{content: re}]}),
        chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`)
      ])
        // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.equal(data.length);
        });
    }); 

    it('should return empty array if searchterm is invalid', function(){
      let searchTerm = '47821478214782942879';
      const re = new RegExp(searchTerm, 'i');
      return Promise.all([
        Note.find({$or: [{title: re},{content: re}]}),
        chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`)
      ])
        // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.equal(data.length);
        });
    });

    it('should return the results of the folderId query search', function(){
      let doc;
      let length;
      return Note.findOne()
        .then(res => {
          doc = res;
          return chai.request(app).get(`/api/notes?folderId=${doc.folderId}`);  
        })
        .then(res => {
          length = res.body.length;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return Note.find({folderId: doc.folderId});
        })
        .then(res => {
          expect(res.length).to.equal(length);
        });
    });
  });

  describe('PUT /api/notes/:id', function(){
    it('should update the item when given valid id', function(){
      const updateItem = {
        title: 'test',
        content: 'tete'
      };
      let data; 
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/notes/${data.id}`).send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.content).to.equal(updateItem.content);
          expect(res.body.title).to.equal(updateItem.title);
          expect(res.body.id).to.equal(data.id);
        });
    });

    it('should return an error 400 and you need title message', function(){
      const newItem = {
        'titdasle': 'The best article about cats ever!',
      };
      let data;
      return Note.findOne()
        .then(res => {
          data = res;
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .send(newItem);
        })      
        .then(function (res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('You need a title');
          // 2) then call the database
        });
    });

    it('should return an error 400 and invalid id message', function(){
      const newItem = {
        'title': 'The best article about cats ever!',
      };
      const badId = '2782178947128937218';
      return chai.request(app).put(`/api/notes/${badId}`).send(newItem)
        .then(function (res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Invalid Id');
          // 2) then call the database
        });
    });
  });

  describe('DELETE /api/note/:id', function(){
    it('should delete when passed a valid id', function(){
      let data;
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
        });
    });
    
  });
});



