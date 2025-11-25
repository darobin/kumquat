
import { pino } from 'pino';

// Syntax for indices (each entry):
//  - fields: array of field names to index, can be deep.in.the.object
//  - name: optional name of the index
//  - partial_filter_selector: optional Mango filter to decide what to include

export default class Context {
  lexica;
  dbPath;
  constructor ({ lexica, dbPath, indices, logger, port } = {}) {
    this.lexica = lexica;     // array of lexica or lexica wildcards
    this.dbPath = dbPath;     // absolute path to where the DB is stored
    this.indices = indices;   // array of PouchDB index specifications
    this.port = port || 4080; // port for the server
    this.logger = logger || pino({ name: 'kumquat' });
  }
}
