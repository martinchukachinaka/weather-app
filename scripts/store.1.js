var store = {
  init: function() {
    window.indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction ||
      window.webkitIDBTransaction ||
      window.msIDBTransaction || { READ_WRITE: 'readwrite' }; // This line should only be needed if it is needed to support the object's constants for older browsers
    window.IDBKeyRange =
      window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    if (!window.indexedDB) {
      window.alert("your browser don't work right with indexdb");
    }
  },
  openDb: function(dbName) {
    var request = window.indexedDB.open(dbName, 3);
    request.onerror = function(event) {
      console.error("didn't work. waht's going on? Message: ", event);
    };
    request.onsuccess = function(event) {
      console.log('event: ', event);
      this.db = event.target.result;
    };

    return request;
  },

  createCustomerData(event) {
    const customerData = [
      { ssn: '444-44-4444', name: 'Bill', age: 35, email: 'bill@company.com' },
      { ssn: '555-55-5555', name: 'Donna', age: 32, email: 'donna@home.org' }
    ];

    // request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore('customers', { keyPath: 'ssn' });
    objectStore.createIndex('name', 'name', { unique: false });
    objectStore.createIndex('email', 'email', { unique: true });

    objectStore.transaction.oncomplete = function(event) {
      var customerObjectStore = db
        .transaction('customers', 'readwrite')
        .objectStore('customers');

      customerData.forEach(function(customer) {
        customerObjectStore.add(customer);
      });
    };
    // };
  }
};
