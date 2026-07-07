const STORAGE_KEY = "webgis-sampah-transactions";

function getStorage(storage) {
  if (storage) return storage;

  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return null;
}

export function readTransactions(storage = null) {
  const store = getStorage(storage);

  if (!store) {
    return [];
  }

  try {
    const raw = store.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addTransaction(payload, storage = null) {
  const store = getStorage(storage);

  const transaction = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    amount: Number(payload.amount || 0),
    description: payload.description || "Transaksi keuangan",
    source: payload.source || "warga",
    warga_id: payload.warga_id || null,
    courier_id: payload.courier_id || null,
    created_at: new Date().toISOString(),
  };

  const existing = readTransactions(store);
  const next = [transaction, ...existing];

  if (store) {
    store.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return transaction;
}

export function getTransactionSummary(transactions = []) {
  const warga = transactions.filter((item) => item.source === "warga");
  const courier = transactions.filter((item) => item.source === "courier");

  return {
    warga: {
      count: warga.length,
      total: warga.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    },
    courier: {
      count: courier.length,
      total: courier.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    },
  };
}

export function clearTransactions(storage = null) {
  const store = getStorage(storage);
  if (store) {
    store.removeItem(STORAGE_KEY);
  }
}
