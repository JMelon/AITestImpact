require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use the MONGODB_URI from .env file or use a default value
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/testingtools';
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected...');
    
    // Get all collections
    const collections = await mongoose.connection.db.collections();
    
    // Loop through all collections and delete all documents
    for (const collection of collections) {
      const collectionName = collection.collectionName;
      const result = await collection.deleteMany({});
      console.log(`Cleared collection '${collectionName}': ${result.deletedCount} documents deleted`);
    }
    
    console.log('All collections have been cleared!');
  } catch (err) {
    console.error('Database clear error:', err);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

connectDB();
