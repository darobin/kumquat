
// - sets up firehose with the right filters
// - listens to the firehose
// - ideally we'd like the real firehose and attach the DRISL to the doc that
//    gets saved

export default class Firehose {
  #ctx;
  constructor (ctx) {
    this.#ctx = ctx;
  }
}
