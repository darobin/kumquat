
import * as PouchDB from 'pouchdb';

// - set up, create DB
// - add/remove index
// - add/update/delete correctly
// - run query, checking that it's hitting an index

export class KumquatDB {
  #db;
  constructor (name) {
    this.#db = new PouchDB(name); // XXX needs more options
  }
  create (obj) {
    // - make an ID from the URI
    // - store it there
  }
  update (obj) {
    // - fetch latest version
    // - save
  }
  delete (obj) {
    // - drop that ID
  }
}
