'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function () {
  const username = 'David';
  const password = 'password';
  const fullname = 'David Johnson';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true, useCreateIndex : true })
      .then(() => User.deleteMany());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return User.deleteMany();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('POST /api/users', function () {

    it('Should create a new user', function () {
      let res;
      return chai
        .request(app)
        .post('/api/users')
        .send({ username, password, fullname })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'username', 'fullname');
          expect(res.body.id).to.exist;
          expect(res.body.username).to.equal(username);
          expect(res.body.fullname).to.equal(fullname);
          return User.findOne({ username });
        })
        .then(user => {
          expect(user).to.exist;
          expect(user.id).to.equal(res.body.id);
          expect(user.fullname).to.equal(fullname);
          return user.validatePassword(password);
        })
        .then(isValid => {
          expect(isValid).to.be.true;
        });
    });

     it('Should reject users with missing username', function () {
      let res;
      return chai
      .request(app)
      .post('/api/users')
      .send({password, fullname})
      .then(_res => {
        res = _res;
      })
       
     });

     it('Should reject users with missing password', function () {
      let res;
      return chai
      .request(app)
      .post('/api/users')
      .send({username, fullname})
      .then(_res => {
        res = _res;
      })
     });

     it('Should reject users with non-string username', function () {
      let res;
      return chai
      .request(app)
      .post('/api/users')
      .send({username: 234234, password, fullname})
      .then(_res => {
        res = _res;
      })
     });

     it('Should reject users with non-string password', function () {
      let res;
      return chai
      .request(app)
      .post('/api/users')
      .send({username, password:29387429873, fullname})
      .then(_res => {
        res = _res;
      })
     });

    it('Should reject users with non-trimmed username', function () {
      let res;
      return chai
      .request(app)
      .post('/api/users')
      .send({username: "       David       ", password, fullname})
      .then(_res => {
        res = _res;
      })
     });

     it('Should reject users with non-trimmed password', function () {
      let res;
      return chai
      .request(app)
      .post('/api/users')
      .send({username: "David", password: "      password          ", fullname})
      .then(_res => {
        res = _res;
      })
     });
     });

     it('Should reject users with empty username', function () {
      let res;
      return chai
      .request(app)
      .post('/api/users')
      .send({username: "", password, fullname})
      .then(_res => {
        res = _res;
      })
     });
     });
/*
     it('Should reject users with password less than 8 characters', function () {
      let res;
      return chai
      .request(app)
      .post('/api/users')
      .send({username: "David", password:"1234", fullname})
      .then(_res => {
        res = _res;
      })
     });

    it('Should reject users with password greater than 72 characters', function () {
      let res;
      return chai
      .request(app)
      .post('/api/users')
      .send({username: "David", password:"1654654654654654654654984828465132123061516351354185949819649846897496494634546145315496135489135468135461354561385135135134834354135135435135132133513212164568145349696", fullname})
      .then(_res => {
        res = _res;
      })
    });

     it('Should reject users with duplicate username', function () {
      return chai
      .request(app)
      .post('/api/users')
      .send({ username, password, fullname })
      .then(_res => {
        res = _res;
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'username', 'fullname');
        expect(res.body.id).to.exist;
        expect(res.body.username).to.equal(username);
        expect(res.body.fullname).to.equal(fullname);
        return res
      })
      .then(user => {
        return chai
        .request(app)
        .post('/api/users')
        .send({ username, password, fullname })
      })
      .then(_res => {
        
     });
    });

     it('Should trim fullname', function () {
      return chai
      .request(app)
      .post('/api/users')
      .send({ username, password, fullname: "     David Johnson      " })
      .then(_res => {
     }); 

});*/