export class StoreService {
  constructor() {
    this.dbPromise = idb.open(APP_CONSTANTS.DB, 1, upgradeDb => {
      console.log('to do upgrade related things on...', upgradeDb);
      upgradeDb.createObjectStore('user', { keyPath: 'id' });
      upgradeDb.createObjectStore(APP_CONSTANTS.USER_KEY, { keyPath: 'id' });
    });
  }

  storeItem(store, item) {
    return this.dbPromise
      .then(db => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).add(item);
        return tx.complete;
      })
      .catch(rejected => {
        console.error('rejected: ', rejected);
        return rejected;
      });
  }

  fetchItem(store, key) {
    return this.dbPromise.then(db =>
      db
        .transaction(store)
        .objectStore(store)
        .get(key)
    );
  }

  list(store) {
    return this.dbPromise.then(db =>
      db
        .transaction(store)
        .objectStore(store)
        .getAll()
    );
  }

  removeItem(store, key) {
    return this.dbPromise.then(db => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(key);
      return tx.complete;
    });
  }

  removeItems(store, keys) {
    if (keys) {
      return this.dbPromise.then(db => {
        const tx = db.transaction(store, 'readwrite');
        const objStore = tx.objectStore(store);
        keys.forEach(key => {
          objStore.delete(key);
        });
        return tx.complete;
      });
    } else {
      return Promise.reject(null);
    }
  }

  clear(store) {
    return this.dbPromise
      .then(db => {
        const tx = db.transaction(store, 'readwrite');
        const objStore = tx.objectStore(store);
        objStore.clear();
        return tx.complete;
      })
      .catch(error => Promise.reject(error));
  }
}
