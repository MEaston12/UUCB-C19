let db;
const request = indexedDB.open('transaction_tracker', 1);

const storeName = 'new_transaction';

request.onupgradeneeded = e => {
    const db = e.target.result;
    db.createObjectStore(storeName, { autoIncrement: true })
};

request.onsuccess = e => {
    db = e.target.result;
    if (navigator.onLine) {
        uploadTransactions();
    }
};

request.onerror = e => {
    console.log(e.target.errorCode);
};

const saveRecord = record => {
    db.transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .add(record)
};

const uploadTransactions = () => {
    // access your pending object store
    const transactionStore = db.transaction([storeName], 'readwrite').objectStore(storeName);

    // get all records from store and set to a variable
    const getAll = transactionStore.getAll();

    getAll.onsuccess = async () => {
        // if there was data in indexedDb's store, let's send it to the api server
        if(getAll.result.length <= 0) return;
        const response = await fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json());
        if (response.message) {
            throw new Error(response);
        }
        // clear all items in your store
        db.transaction([storeName], 'readwrite').objectStore(storeName).clear();
        transactions.unshift(...getAll.result);
        populateChart();
        populateTable();
        populateTotal();
    };
};