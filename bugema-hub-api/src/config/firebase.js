const admin = require('firebase-admin');
const { 
  FIREBASE_PROJECT_ID, 
  FIREBASE_CLIENT_EMAIL, 
  FIREBASE_PRIVATE_KEY, 
  FIREBASE_DATABASE_URL 
} = require('./env');

// Initialize Firebase Admin SDK with environment variables
let db, auth, storage;

try {
  // Check if we're using test credentials
  if (FIREBASE_PRIVATE_KEY === 'fake-private-key-for-testing') {
    console.log('🧪 Running in test mode with mock Firebase');
    
    // Simple in-memory store for mock
    const store = {
      users: new Map()
    };

    const mockDoc = (collection, id) => ({
      get: () => {
        const data = store[collection]?.get(id);
        return Promise.resolve({ 
          exists: !!data,
          id,
          data: () => data || null 
        });
      },
      set: (data) => {
        if (!store[collection]) store[collection] = new Map();
        store[collection].set(id, data);
        return Promise.resolve();
      },
      update: (data) => {
        const existing = store[collection]?.get(id) || {};
        store[collection].set(id, { ...existing, ...data });
        return Promise.resolve();
      },
      delete: () => {
        store[collection]?.delete(id);
        return Promise.resolve();
      }
    });

    const mockQuery = (collection) => {
      let filteredDocs = Array.from(store[collection]?.values() || []);
      
      const query = {
        where: (field, op, value) => {
          filteredDocs = filteredDocs.filter(doc => {
            if (op === '==') return doc[field] === value;
            if (op === '>=') return doc[field] >= value;
            if (op === '<=') return doc[field] <= value;
            return true;
          });
          return query;
        },
        limit: () => query,
        orderBy: () => query,
        startAfter: () => query,
        get: () => Promise.resolve({ 
          docs: filteredDocs.map(d => ({ id: d.uid || 'mock-id', data: () => d })),
          size: filteredDocs.length,
          forEach: (cb) => filteredDocs.forEach(d => cb({ id: d.uid || 'mock-id', data: () => d }))
        }),
        add: (data) => {
          const id = 'mock-' + Math.random().toString(36).substr(2, 9);
          if (!store[collection]) store[collection] = new Map();
          store[collection].set(id, data);
          return Promise.resolve({
            id,
            get: () => Promise.resolve({
              id,
              data: () => data
            })
          });
        },
        doc: (id) => mockDoc(collection, id)
      };
      return query;
    };

    db = {
      collection: (name) => mockQuery(name),
      batch: () => ({
        set: () => {},
        update: () => {},
        delete: () => {},
        commit: () => Promise.resolve()
      })
    };
    auth = {
      createUser: (data) => {
        const uid = data.uid || 'mock-user-' + Math.random().toString(36).substr(2, 9);
        return Promise.resolve({ uid, ...data });
      },
      getUser: (uid) => Promise.resolve({ uid, email: 'mock@example.com' }),
      deleteUser: () => Promise.resolve(),
      verifyIdToken: (token) => Promise.resolve({ uid: 'mock-user-id', email: 'test@example.com' })
    };
    storage = {
      bucket: () => ({
        file: () => ({
          createWriteStream: () => ({ on: () => {}, end: () => {} }),
          delete: () => Promise.resolve()
        })
      })
    };
  } else {
    // Create service account object from environment variables
    const serviceAccount = {
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY
    };

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: FIREBASE_PROJECT_ID,
      databaseURL: FIREBASE_DATABASE_URL,
      storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`
    });

    // Initialize services
    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();

    // Configure Firestore settings for better performance
    const settings = {
      timestampsInSnapshots: true,
      ignoreUndefinedProperties: true
    };
    db.settings(settings);

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`   - Project ID: ${FIREBASE_PROJECT_ID}`);
    console.log(`   - Database URL: ${FIREBASE_DATABASE_URL}`);
  }

} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  console.error('Please check your Firebase environment variables:');
  console.error('   - FIREBASE_PROJECT_ID');
  console.error('   - FIREBASE_CLIENT_EMAIL');
  console.error('   - FIREBASE_PRIVATE_KEY');
  console.error('   - FIREBASE_DATABASE_URL');
  process.exit(1);
}

// Export Firebase services
module.exports = {
  admin,
  db,
  auth,
  storage
};
