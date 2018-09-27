const WEATHER_STORE = 'weather_forecast';
const dbPromise = idb.open('udacity-db', 1, upgradeDb => {
  upgradeDb.createObjectStore(WEATHER_STORE);
});

class StoreService {
  constructor() {
    this.dbPromise = idb.open('udacity-db', 1, upgradeDb => {
      console.log('to do upgrade related things on...', upgradeDb);
      upgradeDb.createObjectStore(WEATHER_STORE, { keyPath: 'key' });
    });
  }

  storeItem(store, item, key = null) {
    return this.dbPromise
      .then(db => {
        const tx = db.transaction(store, 'readwrite');
        if (key) {
          tx.objectStore(store).add(item, key);
        } else {
          tx.objectStore(store).add(item);
        }
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
        .transaction(store, 'readonly')
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

const store = new StoreService();
