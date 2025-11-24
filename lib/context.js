
export default class Context {
  lexica;
  constructor ({ lexica } = {}) {
    this.lexica = lexica; // array of lexica or lexica wildcards
  }
}
