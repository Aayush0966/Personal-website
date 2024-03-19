const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: '', // Replace 'YOUR_PROJECT_ID' with your actual project ID
  keyFilename: null, // Set keyFilename to null to disable key file usage
  credentials: {
    client_email: '', // Replace 'YOUR_CLIENT_EMAIL' with your actual client email
    private_key: '' },
});

const bucketName = ''; // Replace with your actual bucket name

exports.handler = async (event, context) => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(process.env.DB_NAME);

    const authorizationHeader = event.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Bearer token is missing in Authorization header' })
      };
    }

    const token = authorizationHeader.split(' ')[1]; // Extract the token from the authorization header

    // Verify the authentication token
    const decodedToken = jwt.verify(token, 'your-secret-key'); // Replace 'your-secret-key' with your actual secret key used for signing tokens
    const userId = decodedToken.userId;

    const body = JSON.parse(event.body);
    const photoName = body.photoName;

    if (!photoName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Photo name not provided' })
      };
    }

    // Retrieve user data from the database to get the photo filename
    const user = await db.collection('Profile').findOne({ userId: userId });

    if (!user || !user.Picture) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User or user picture not found' })
      };
    }

    // Delete the photo file from Google Cloud Storage
    await deleteFileFromStorage(photoName);

    // Remove the Picture field from the user document in the database
    const result = await db.collection('Profile').updateOne(
      { userId: userId },
      { $unset: { Picture: '' } }
    );

    if (result.modifiedCount !== 1) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to remove photo' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Photo removed successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

// Function to delete a file from Google Cloud Storage
async function deleteFileFromStorage(photoName) {
  try {
    console.log(bucketName, photoName);
    await storage.bucket(bucketName).file(photoName).delete();
  } catch (error) {
    console.error('Error deleting file from Google Cloud Storage:', error);
    throw error;
  }
}
