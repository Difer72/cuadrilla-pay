import Dexie from 'dexie';

export const db = new Dexie('CuadrillaPayDB');

db.version(1).stores({
  workers: '++id, name',
  cargues: '++id, amount, desc, time, split'
});

export const addWorker = async (name) => {
  return await db.workers.add({ name });
};

export const deleteWorker = async (id) => {
  return await db.workers.delete(id);
};

export const getWorkers = async () => {
  return await db.workers.toArray();
};

export const addCargue = async (cargue) => {
  return await db.cargues.add(cargue);
};

export const getCargues = async () => {
  return await db.cargues.orderBy('id').reverse().toArray();
};

export const clearCargues = async () => {
  return await db.cargues.clear();
};
