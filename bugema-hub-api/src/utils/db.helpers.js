const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Get a single document from Firestore
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} Document data with ID, or null if not found
 */
async function getDoc(collection, id) {
  try {
    const docRef = db.collection(collection).doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error(`Error getting document ${id} from collection ${collection}:`, error);
    throw new Error(`Failed to retrieve document: ${error.message}`);
  }
}

/**
 * Get multiple documents from a collection with optional filters and options
 * @param {string} collection - Collection name
 * @param {Array} filters - Array of [field, operator, value] filters
 * @param {Object} options - Query options { limit, orderBy, startAfter, where }
 * @returns {Promise<Array>} Array of documents with IDs
 */
async function getCollection(collection, filters = [], options = {}) {
  try {
    let query = db.collection(collection);
    
    // Apply filters
    filters.forEach(([field, operator, value]) => {
      query = query.where(field, operator, value);
    });
    
    // Apply ordering
    if (options.orderBy) {
      if (Array.isArray(options.orderBy)) {
        options.orderBy.forEach(([field, direction = 'asc']) => {
          query = query.orderBy(field, direction);
        });
      } else {
        query = query.orderBy(options.orderBy);
      }
    }
    
    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    // Apply pagination
    if (options.startAfter) {
      query = query.startAfter(options.startAfter);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting collection ${collection}:`, error);
    throw new Error(`Failed to retrieve collection: ${error.message}`);
  }
}

/**
 * Create a new document in Firestore
 * @param {string} collection - Collection name
 * @param {Object} data - Document data
 * @returns {Promise<Object>} Created document with ID
 */
async function createDoc(collection, data) {
  try {
    const docData = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isDeleted: false
    };
    
    const docRef = await db.collection(collection).add(docData);
    const docSnap = await docRef.get();
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error(`Error creating document in collection ${collection}:`, error);
    throw new Error(`Failed to create document: ${error.message}`);
  }
}

/**
 * Update an existing document in Firestore
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated document with ID
 */
async function updateDoc(collection, id, data) {
  try {
    // Check if document exists
    const existingDoc = await getDoc(collection, id);
    if (!existingDoc) {
      throw new Error(`Document with ID ${id} not found in collection ${collection}`);
    }
    
    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    };
    
    const docRef = db.collection(collection).doc(id);
    await docRef.update(updateData);
    
    // Return updated document
    return await getDoc(collection, id);
  } catch (error) {
    console.error(`Error updating document ${id} in collection ${collection}:`, error);
    throw new Error(`Failed to update document: ${error.message}`);
  }
}

/**
 * Soft delete a document (mark as deleted)
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Updated document with deletion info
 */
async function deleteDoc(collection, id) {
  try {
    // Check if document exists
    const existingDoc = await getDoc(collection, id);
    if (!existingDoc) {
      throw new Error(`Document with ID ${id} not found in collection ${collection}`);
    }
    
    const deleteData = {
      isDeleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    
    const docRef = db.collection(collection).doc(id);
    await docRef.update(deleteData);
    
    return {
      id,
      ...deleteData
    };
  } catch (error) {
    console.error(`Error deleting document ${id} in collection ${collection}:`, error);
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}

/**
 * Perform paginated query on a collection
 * @param {string} collection - Collection name
 * @param {Array} filters - Array of [field, operator, value] filters
 * @param {number} pageSize - Number of documents per page
 * @param {string} cursor - Pagination cursor (document ID)
 * @param {Object} orderBy - Order specification { field, direction }
 * @returns {Promise<Object>} Paginated result with data and pagination info
 */
async function paginatedQuery(collection, filters = [], pageSize = 20, cursor = null, orderBy = { field: 'createdAt', direction: 'desc' }) {
  try {
    let query = db.collection(collection);
    
    // Apply filters
    filters.forEach(([field, operator, value]) => {
      query = query.where(field, operator, value);
    });
    
    // Apply ordering
    query = query.orderBy(orderBy.field, orderBy.direction || 'desc');
    
    // Apply pagination
    if (cursor) {
      const cursorDoc = await db.collection(collection).doc(cursor).get();
      query = query.startAfter(cursorDoc);
    }
    
    // Apply limit
    query = query.limit(pageSize + 1); // Get one extra to check if there are more
    
    const snapshot = await query.get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Check if there are more documents
    const hasMore = documents.length > pageSize;
    
    // Remove the extra document if it exists
    if (hasMore) {
      documents.pop();
    }
    
    // Get next cursor
    const nextCursor = hasMore && documents.length > 0 ? documents[documents.length - 1].id : null;
    
    return {
      data: documents,
      nextCursor,
      hasMore,
      pageSize,
      totalCount: documents.length
    };
  } catch (error) {
    console.error(`Error in paginated query for collection ${collection}:`, error);
    throw new Error(`Failed to perform paginated query: ${error.message}`);
  }
}

/**
 * Atomically increment a field in a document
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @param {string} field - Field name to increment
 * @param {number} amount - Amount to increment (can be negative)
 * @returns {Promise<Object>} Updated document
 */
async function incrementField(collection, id, field, amount = 1) {
  try {
    const docRef = db.collection(collection).doc(id);
    
    // Check if document exists
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      throw new Error(`Document with ID ${id} not found in collection ${collection}`);
    }
    
    // Atomic increment
    await docRef.update({
      [field]: FieldValue.increment(amount),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Return updated document
    return await getDoc(collection, id);
  } catch (error) {
    console.error(`Error incrementing field ${field} in document ${id}:`, error);
    throw new Error(`Failed to increment field: ${error.message}`);
  }
}

/**
 * Batch update multiple documents
 * @param {Array} updates - Array of { collection, id, data } objects
 * @returns {Promise<Array>} Array of updated documents
 */
async function batchUpdate(updates) {
  try {
    const batch = db.batch();
    const results = [];
    
    for (const update of updates) {
      const { collection, id, data } = update;
      const docRef = db.collection(collection).doc(id);
      
      const updateData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      batch.update(docRef, updateData);
      results.push({ collection, id, data: updateData });
    }
    
    await batch.commit();
    
    // Fetch updated documents
    const updatedDocs = [];
    for (const result of results) {
      const updatedDoc = await getDoc(result.collection, result.id);
      updatedDocs.push(updatedDoc);
    }
    
    return updatedDocs;
  } catch (error) {
    console.error('Error in batch update:', error);
    throw new Error(`Failed to perform batch update: ${error.message}`);
  }
}

/**
 * Count documents in a collection with optional filters
 * @param {string} collection - Collection name
 * @param {Array} filters - Array of [field, operator, value] filters
 * @returns {Promise<number>} Document count
 */
async function countDocuments(collection, filters = []) {
  try {
    let query = db.collection(collection);
    
    // Apply filters
    filters.forEach(([field, operator, value]) => {
      query = query.where(field, operator, value);
    });
    
    const snapshot = await query.get();
    return snapshot.size;
  } catch (error) {
    console.error(`Error counting documents in collection ${collection}:`, error);
    throw new Error(`Failed to count documents: ${error.message}`);
  }
}

/**
 * Check if a document exists
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<boolean>} True if document exists
 */
async function docExists(collection, id) {
  try {
    const docRef = db.collection(collection).doc(id);
    const docSnap = await docRef.get();
    return docSnap.exists;
  } catch (error) {
    console.error(`Error checking if document ${id} exists in collection ${collection}:`, error);
    return false;
  }
}

/**
 * Search documents by text (simple implementation)
 * @param {string} collection - Collection name
 * @param {string} searchField - Field to search in
 * @param {string} searchTerm - Search term
 * @param {Array} filters - Additional filters
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of matching documents
 */
async function searchDocuments(collection, searchField, searchTerm, filters = [], options = {}) {
  try {
    // For simple text search, we'll use a case-insensitive approach
    // In production, consider using Algolia or Elasticsearch for better search
    let query = db.collection(collection);
    
    // Apply additional filters first
    filters.forEach(([field, operator, value]) => {
      query = query.where(field, operator, value);
    });
    
    const snapshot = await query.get();
    
    // Filter results client-side for text search
    const searchResults = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(doc => {
        const fieldValue = doc[searchField];
        if (fieldValue && typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    
    // Apply ordering and limit client-side
    if (options.orderBy) {
      searchResults.sort((a, b) => {
        const aValue = a[options.orderBy.field];
        const bValue = b[options.orderBy.field];
        const direction = options.orderBy.direction === 'desc' ? -1 : 1;
        
        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
      });
    }
    
    if (options.limit) {
      searchResults.splice(options.limit);
    }
    
    return searchResults;
  } catch (error) {
    console.error(`Error searching documents in collection ${collection}:`, error);
    throw new Error(`Failed to search documents: ${error.message}`);
  }
}

module.exports = {
  getDoc,
  getCollection,
  createDoc,
  updateDoc,
  deleteDoc,
  paginatedQuery,
  incrementField,
  batchUpdate,
  countDocuments,
  docExists,
  searchDocuments
};
