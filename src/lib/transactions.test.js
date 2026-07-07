import test from "node:test";
import assert from "node:assert/strict";

import { addTransaction, getTransactionSummary, readTransactions } from "./transactions.js";

function createStorage() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test("menghitung total transaksi warga dan courier", () => {
  const storage = createStorage();

  addTransaction(
    {
      source: "warga",
      warga_id: 1,
      amount: 15000,
      description: "Iuran bulanan",
    },
    storage
  );

  addTransaction(
    {
      source: "courier",
      courier_id: 7,
      amount: 25000,
      description: "Komisi angkut",
    },
    storage
  );

  const transactions = readTransactions(storage);
  const summary = getTransactionSummary(transactions);

  assert.equal(summary.warga.count, 1);
  assert.equal(summary.warga.total, 15000);
  assert.equal(summary.courier.count, 1);
  assert.equal(summary.courier.total, 25000);
});
