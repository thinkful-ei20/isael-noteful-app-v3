'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');
const mongoose = require('mongoose');

const { Folder } = require('../models/folder');
const { TEST_MONGODB_URI } = require('../config');

const app = require('../server.js');
const seedData = require('../db/seed/folders');
const expect = chai.expect;

chai.use(chaiHttp);

describe('folders api', function(){

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI);
  });

  beforeEach(function(){
    return Folder.insertMany(seedData)
      .then(() => {
        Folder.createIndexes();
      });
  });

  afterEach(function(){
    return mongoose.connection.db.dropDatabase();
  });

  after(function(){
    return mongoose.disconnect();
  });


  describe('get all from /api/folders ', function(){
    it('should return all the folders', function(){
      return Promise.all([
        chai.request(app).get('/api/folders'),
        Folder.find()
      ])
        .then(([res,data]) => {
          expect(res).to.be.json;
          expect(res.status).to.equal(200);
          expect(res.body.length).to.equal(data.length);
          res.body.forEach((folder, i) => {
            expect(folder._id).to.equal(data[i].id);
            expect(new Date(folder.createdAt).getTime()).to.equal(new Date(data[i].createdAt).getTime());
            expect(new Date(folder.updatedAt).getTime()).to.equal(new Date(data[i].updatedAt).getTime());
          });
        });
    });

    // it('should return 404 when no results', function(){
      
    //   return Promise.all([
    //     chai.request(app).get('/api/folders')
    //   ])
    //   .then();
    // });
  });

  describe('GET BY ID /api/folder:id', function(){
    it('should return a folder when passed a valid id', function(){
      let data;

      return Folder.findOne()
        .then(res => {
          data = res;
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body._id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt).getTime()).to.equal(new Date(data.createdAt).getTime());
          expect(new Date(res.body.updatedAt).getTime()).to.equal(new Date(data.updatedAt).getTime());
        });
    });
    it('should return an error when passes an invalid id', function(){
      return chai.request(app).get('/api/folders/dhjsakldjaskldsjakl')
        .then(res => {
          expect(res).to.be.json;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('the `id` is not valid');
        });
    });
    it('should return 404 with none existent id', function(){
      const id = '111111111111111111110015';
      return chai.request(app).get(`/api/folders/${id}`)
        .then(res => {
          expect(res).status(404);
          return Folder.findById(id);
        })
        .then(res => {
          expect(res).to.equal(null);
        });
    });
  });

  describe('POST BY ID /api/folders', function(){
    it('should return a new folder when given a name', function(){
      let obj = {
        name: 'test'
      };
      let response;
      return chai.request(app).post('/api/folders').send(obj)
        .then(res =>{
          expect(res).to.have.status(201);
          expect(res).be.json;
          expect(res.header.location).to.exist;
          response = res;
          return Folder.findById(res.body._id);
        })
        .then(res => {
          expect(res.id).to.equal(response.body._id);
          expect(res.name).to.equal(response.body.name);
          expect(new Date(res.createdAt).getTime()).to.equal(new Date(response.body.createdAt).getTime());
          expect(new Date(res.updatedAt).getTime()).to.equal(new Date(response.body.updatedAt).getTime());
        });
    });
    it('should return missing name when passed without name', function(){
      const obj = {};

      return chai.request(app).post('/api/folders/').send(obj)
        .then(res => {
          expect(res).to.be.json;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('need name');
        });
    });
  });

  describe('PUT BY ID /api/folders/:id', function(){
    it('should return an object with updated item', function(){
      let data;
      let obj = {
        name:'test'
      };
      return Folder.findOne()
        .then(res => {
          return chai.request(app).put(`/api/folders/${res.id}`).send(obj);
        })
        .then(res =>{
          data = res;
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal(obj.name);
          //expect(res.body._id).to.equal(data.body.id);
          expect(res.body).to.have.keys(['name', '_id','createdAt', 'updatedAt', '__v']);
          return Folder.findById(res.body._id);
        })
        .then(res => {
          // console.log(data);
          expect(res.name).to.equal(data.body.name);
          expect(res.id).to.equal(data.body._id);
          expect(new Date(res.createdAt).getTime()).to.equal(new Date(data.body.createdAt).getTime());
          expect(new Date(res.updatedAt).getTime()).to.equal(new Date(data.body.updatedAt).getTime());
        });
    });
    it('should return if its invalid id', function(){
      const id = 'abc';
      const obj = {
        name: 'title'
      };

      return chai.request(app).put(`/api/folders/${id}`).send(obj)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('the `id` is not valid');
        });
    });
    it('should return an error if has invalid data', function(){
      let obj = {

      };
      return Folder.findOne()
        .then(res => {
          return chai.request(app).put(`/api/folders/${res.id}`).send(obj);
        })
        .then((res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('need name');
        });

    });
    it('should return 404 if id does not exist', function() {
      const id = '111111111111111111110100';
      const obj = {
        name: 'test'
      };

      return chai.request(app).put(`/api/folders/${id}`).send(obj)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('Not Found');
          return Folder.findById(id);
        })
        .then(res => {
          expect(res).to.equal(null);
        });

    });
  });

  describe('Delete BY Id /api/folders/:id', function(){
    it('should delete folder if id it exists', function(){
      let id;
      return Folder.findOne()
        .then(res => {
          id = res.id;
          return chai.request(app).del(`/api/folders/${res.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.a('object');
          return Folder.findById(id);
          // console.log(res.body);
        })
        .then(res => {
          expect(res).to.equal(null);
        });
    });
  });
});