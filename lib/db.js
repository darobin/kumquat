
import * as PouchExports from 'pouchdb';
import * as PouchFindExports from 'pouchdb-find';

const PouchDB = PouchExports.default;
const PouchFind = PouchFindExports.default;
PouchDB.plugin(PouchFind);

// - add/remove index
// - add/update/delete correctly
// - run query, checking that it's hitting an index

export default class DB {
  #ctx;
  #db;
  constructor (ctx) {
    this.#ctx = ctx;
    this.#db = new PouchDB(ctx.dbPath);
  }
  async start () {
    if (this.#ctx.indices) {
      await Promise.all(this.#ctx.indices.map(idx => this.#db.createIndex(idx)));
    }
  }
  async close () {
    // noop
  }
  async info () {
    return await this.#db.info();
  }
  async create (obj) {
    this.#ctx.logger.info(`creating object ${obj._id}`);
    return await this.#db.put(obj);
  }
  async update (obj) {
    try {
      const old = await this.#db.get(obj._id);
      this.#ctx.logger.info(`updating object ${obj._id} (from ${old._rev})`);
      return await this.#db.put({ ...obj, _rev: old._rev });
    }
    catch (err) {
      if (err.status === 404) return await this.create(obj);
      throw err;
    }
  }
  async delete (obj) {
    try {
      const old = await this.#db.get(obj._id);
      this.#ctx.logger.info(`deleting object ${obj._id} (from ${old._rev})`);
      return await this.#db.remove(obj._id, old._rev);
    }
    catch (err) {
      if (err.status === 404) return { ok: true, _id: obj._id };
      throw err;
    }
  }
  async explain (q) {
    return await this.#db.explain(q);
  }
  // See https://pouchdb.com/api.html#query_index
  async find (q) {
    const exp = await this.#db.explain(q);
    if (exp.index.name === '_all_docs') throw new Error(`Query does not hit a defined index`);
    return await this.#db.find(q);
  }
  async allDocs () {
    return await this.#db.allDocs({
      include_docs: true,
      conflicts: true,
      limit: 100,
    });
  }
}
