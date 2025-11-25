
import { Jetstream, CommitType } from "@skyware/jetstream";

// We receive data from Jetstream that looks like this:
// {
//   "did": "did:plc:j7mrfmbvtlh3lnq2wu6eemib",
//   "time_us": 1764069184091176,
//   "kind": "commit",
//   "commit": {
//     "rev": "3m6h7ikxzcg23",
//     "operation": "create",
//     "collection": "app.bsky.feed.post",
//     "rkey": "3m6h7ike5fs2g",
//     "record": {
//       "$type": "app.bsky.feed.post",
//       "createdAt": "2025-11-25T11:13:03.131Z",
//       "langs": [
//         "ja"
//       ],
//       "text": "自分に作る時はもちさんの分も刷りますね(自分に作る時があるかは不明)"
//     },
//     "cid": "bafyreidqnpms6skgyvcbfnpt6vz3vmg37ztsewwhulnealf2hp3u2uyqlq"
//   }
// }
// We can't store the whole thing because we need to respect CRUD semantics, but
// we also can't just store the record as it doesn't have enough information.
// We turn it into:
// {
//    _id: "${did}/${collection}/${rkey}",
//    did,
//    collection,
//    rkey,
//    cid,
//    record,
// }

export default class Firehose {
  #ctx;
  #jetstream;
  constructor (ctx) {
    this.#ctx = ctx;
    const opts = {};
    if (ctx.lexica) opts.wantedCollections = ctx.lexica;
    this.#jetstream = new Jetstream(opts);
  }
  async start () {
    this.#jetstream.start();
    this.#jetstream.on("commit", async (evt) => {
      const obj = objectify(evt);
      if (evt.commit.operation === CommitType.Create) return await this.#ctx.db.create(obj);
      if (evt.commit.operation === CommitType.Update) return await this.#ctx.db.update(obj);
      if (evt.commit.operation === CommitType.Delete) return await this.#ctx.db.delete(obj);
    });
  }
  async close () {
    this.#jetstream.close();
  }
}

function objectify (evt) {
  const cmt = evt.commit;
  return {
      _id: `${evt.did}/${cmt.collection}/${cmt.rkey}`,
      did: evt.did,
      collection: cmt.collection,
      rkey: cmt.rkey,
      cid: cmt.cid,
      record: cmt.record,
  };
}
