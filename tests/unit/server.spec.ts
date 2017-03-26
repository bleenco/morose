import chai = require('chai');
import chaiHttp = require('chai-http');
import { expect, should } from 'chai';
import { TestServer } from '../helpers/server';

chai.use(chaiHttp);

let server: TestServer;

describe('Server', () => {
  beforeEach((done) => {
    server = new TestServer();
    server.start((cb) => {
      done();
    });
  });

  afterEach((done) => {
    server.stop((cb) => {
      done();
    });
  });

  it('server should initialize itself', () => {
    return chai.request('http://localhost:10000')
      .get('/')
      .then((res: ChaiHttp.Response) => {
        expect(res).to.have.status(200);
      });
  });

});
