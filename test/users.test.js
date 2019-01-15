const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const express = require('express');

const app = require('../server');
const User = require('../models/user');

const { notes, tags, folders } = require('../db/data');
const { TEST_MONGODB_URI } = require('../config');
const Tag = require('../models/tag');
const Note = require('../models/note');
const Folder = require('../models/folder');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Noteful app - Users API Test', function() {
    before(function() {
      return mongoose.connect(TEST_MONGODB_URI, {useNewUrlParser: true})
        .then(() => mongoose.connection.db.dropDatabase());
    });
  
    beforeEach(function() {
      return Promise.all([
        Note.insertMany(notes),
        Folder.insertMany(folders),
        Tag.insertMany(tags)
      ]);
    });
  
    afterEach(function () {
      return mongoose.connection.db.dropDatabase();
    });
  
    after(function () {
      return mongoose.disconnect();
    });
  
    describe('POST /api/users', function() {
      it('should create a new user in the database and return the correct results', function() {
        const userObject = {
            username: 'NewUser',
            password: 'password'
          };
        return chai.request(app)
          .post('/api/users')
          .send(userObject)
          .then(function(res) {
            expect(res).to.have.status(201);
            expect(res.body).to.have.keys('id', 'username');
          });
      });
      
      it('should return a 422 if a field is missing', function() {
        const userObject = {
          username: 'BadUser'
        };
        return chai.request(app)
          .post('/api/users')
          .send(userObject)
          .then(function(res) {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing `Password` in request body');
          });
      });
    });
  
    describe('POST /api/login', function() {
      it('should return username, fullname, and ID if a user is entered into the database', function() {
        const userObject = {
          username: 'CompletelyNewUser',
          fullname: 'Johnny Bravo',
          password: 'password',
        };
        return chai.request(app)
          .post('/api/users')
          .send(userObject)
          .then(function(res) {
            return chai.request(app)
              .post('/api/login')
              .send(userObject);
          })
          .then((res) => {
            body = res.body;
            let { username, fullname } = body;
            expect(res).to.have.status(200);
            expect(body).to.have.all.keys('username', 'fullname', 'id');
            expect(username).to.equal(userObject.username);
            expect(fullname).to.equal(userObject.fullname);
          });
      });
  
      it('should return AuthenticationError if wrong username or password', function() {
        const login = {
          username: 'JohnnyBravo',
          password: 'NoPasssswwoorrddd'
        };
  
        return chai.request(app)
          .post('/api/login')
          .send(login)
          .then(function(res) {
            body = res.body;
            let { name, message } = body;
            expect(res).to.have.status(401);
            expect(name).to.equal('AuthenticationError');
            expect(message).to.equal('Unauthorized');
          });
      });
    });
  });