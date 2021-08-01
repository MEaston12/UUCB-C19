const db = {};

const request = indexedDB.open('transaction_tracker', 1);

request.onupgradeneeded = e => {
    const db = e.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true })
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
    db.transaction(['new_transaction'], 'readwrite')
        .objectStore('new_transaction')
        .add(record)
};

const uploadTransactions = () => {
    // access your pending object store
    const transactionStore = db.transaction(['new_transaction'], 'readwrite').objectStore('new_transaction');

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
        transactionStore.clear();
    };
};