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
  const username = 'New User';
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

  describe.only('POST /api/users', function () {

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

//     it('Should reject users with missing username', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({password})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(400);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//       })
//     });

//     it('Should reject users with missing password', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({username})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(400);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//       })
//     });

//     it('Should reject users with non-string username', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({username: 39393, password: "password"})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(401);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//       })
//     });

//     it('Should reject users with non-string password', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({username: "David", password: 333})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(401);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//         expect(res.body.message).to.equal("Unauthorized");
//       })
//     });

//     it('Should reject users with non-trimmed username', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({username: "David    ", password})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(401);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//         expect(res.body.message).to.equal("Unauthorized");
//       })
//     });

//     it('Should reject users with non-trimmed password', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({username: "David", password:"password      "})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(401);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//         expect(res.body.message).to.equal("Unauthorized");
//       })
//     });

//     it('Should reject users with empty username', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({username: "", password:"password"})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(400);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//         expect(res.body.message).to.equal("Unauthorized");
//       })
//     });

//     it('Should reject users with password less than 8 characters', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({username: "David", password:"pass"})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(401);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//         expect(res.body.message).to.equal("Unauthorized");
//       })
//     });

//     it('Should reject users with password greater than 72 characters', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({username: "David", password:"123456789123456789123456789123456789123456789123456789123456789123456789123456789123416546516516518541681684684864684874651465486169486"})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(401);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//         expect(res.body.message).to.equal("Unauthorized");
//       })
//     });

//     it('Should reject users with duplicate username', function () {
//  //Huhhhhhh??????
//     });

//     it('Should trim fullname', function () {
//       let res
//       return chai
//       .request(app)
//       .post('/api/login')
//       .send({username: "David", password:"password", fullname: "      David Johnson"})
//       .then(_res => {
//         res = _res;
//         expect(res).to.have.status(200);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.key('name', 'message', 'status');
//         expect(res.body.message).to.equal("Unauthorized");
//       })
//     }); That's for login endpoint........... Maybe I can use this later........ :'(

  });

});