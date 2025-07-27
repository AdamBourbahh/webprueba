const admin = require('firebase-admin');

// Inicializar Firebase Admin (solo una vez)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Helper functions para Firestore
const firestoreHelpers = {
  // Obtener un documento
  async getDoc(collection, docId) {
    try {
      const doc = await db.collection(collection).doc(docId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error(`Error getting document ${docId} from ${collection}:`, error);
      throw error;
    }
  },

  // Obtener colección con filtros
  async getCollection(collection, whereClause = null, orderBy = null, limit = null) {
    try {
      let query = db.collection(collection);
      
      if (whereClause) {
        query = query.where(whereClause.field, whereClause.operator, whereClause.value);
      }
      
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      if (limit) {
        query = query.limit(limit);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting collection ${collection}:`, error);
      throw error;
    }
  },

  // Crear documento
  async createDoc(collection, docId, data) {
    try {
      const docRef = docId ? 
        db.collection(collection).doc(docId) : 
        db.collection(collection).doc();
      
      const docData = {
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await docRef.set(docData);
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  },

  // Actualizar documento
  async updateDoc(collection, docId, data) {
    try {
      await db.collection(collection).doc(docId).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document ${docId} in ${collection}:`, error);
      throw error;
    }
  },

  // Eliminar documento
  async deleteDoc(collection, docId) {
    try {
      await db.collection(collection).doc(docId).delete();
    } catch (error) {
      console.error(`Error deleting document ${docId} from ${collection}:`, error);
      throw error;
    }
  },

  // Batch operations
  batch() {
    return db.batch();
  },

  // Transacciones
  async runTransaction(updateFunction) {
    return db.runTransaction(updateFunction);
  },

  // Verificar si existe un documento
  async docExists(collection, docId) {
    try {
      const doc = await db.collection(collection).doc(docId).get();
      return doc.exists;
    } catch (error) {
      console.error(`Error checking if document exists:`, error);
      return false;
    }
  }
};

module.exports = { db, firestoreHelpers, admin }; 