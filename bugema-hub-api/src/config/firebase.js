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
    // Create mock Firebase services for testing
    db = {
      collection: () => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: false, data: () => ({}) }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
          delete: () => Promise.resolve()
        }),
        get: () => Promise.resolve({ docs: [] }),
        add: () => Promise.resolve({ id: 'mock-id' }),
        where: () => ({
          get: () => Promise.resolve({ docs: [] }),
          limit: () => ({ get: () => Promise.resolve({ docs: [] }) })
        })
      })
    };
    auth = {
      createUser: () => Promise.resolve({ uid: 'mock-user-id' }),
      getUser: () => Promise.resolve(null),
      deleteUser: () => Promise.resolve(),
      verifyIdToken: () => Promise.resolve({ uid: 'mock-user-id' })
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
