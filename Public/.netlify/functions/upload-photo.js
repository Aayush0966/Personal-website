const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken'); // Import JWT library
const { MongoClient } = require('mongodb');
const { Storage } = require('@google-cloud/storage'); // Import Google Cloud Storage library

const mongoURI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const jwtSecret = process.env.JWT_SECRET;
const gcsBucketName = ''; // Replace with your bucket name
const storage = new Storage({
    projectId: '', // Replace 'YOUR_PROJECT_ID' with your actual project ID
    keyFilename: null, // Set keyFilename to null to disable key file usage
    credentials: {
      client_email: '', // Replace 'YOUR_CLIENT_EMAIL' with your actual client email
      private_key: ''   },
  });
exports.handler = async (event) => {
    try {
        const fileContent = event.body; // Assuming the file content is passed in the request body
        const contentType = event.headers['content-type']; // Get the content type of the file
        const authToken = event.headers['authorization']; // Get the JWT token from headers

        // Extract user ID from JWT token
        const userId = getUserIdFromToken(authToken);

        // Generate a unique filename based on the current timestamp
        const fileName = `${Date.now()}_photo.${getFileTypeFromContentType(contentType)}`;

        // Upload file to Google Cloud Storage
        await uploadFileToStorage(fileContent, fileName);

        // Generate signed URL for the uploaded file
        const signedUrl = await generateSignedUrl(fileName);

        // Update MongoDB collection
        await updateProfilePicture(userId, signedUrl);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File uploaded successfully', signedUrl })
        };
    } catch (error) {
        console.error(error); // Log the error for debugging
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

// Function to extract file type from content type
function getFileTypeFromContentType(contentType) {
    const parts = contentType.split('/');
    return parts[1]; // Return the file extension
}

// Function to upload file to Google Cloud Storage
async function uploadFileToStorage(fileContent, fileName) {
    const bucket = storage.bucket(gcsBucketName);
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
        metadata: {
            contentType: 'image/jpeg' // Update with the appropriate content type if needed
        },
        resumable: false
    });
    return new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', resolve);
        stream.end(Buffer.from(fileContent, 'base64'));
    });
}

// Function to extract user ID from JWT token
function getUserIdFromToken(token) {
    // Assuming token format is "Bearer <token>", we split and get the second part
    const tokenParts = token.split(' ');
    const jwtToken = tokenParts[1];
    // Decode the JWT token to get the payload which includes user ID
    const decoded = jwt.verify(jwtToken, jwtSecret);
    return decoded.userId;
}

// Function to update profile picture in MongoDB collection
async function updateProfilePicture(userId, pictureUrl) {
    const client = new MongoClient(mongoURI);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('Profile');
        // Update document where userId matches and set the picture field
        await collection.updateOne({ userId: userId }, { $set: { Picture: pictureUrl } });
    } finally {
        await client.close();
    }
}

// Function to generate signed URL for the uploaded file
async function generateSignedUrl(fileName) {
    const bucket = storage.bucket(gcsBucketName);
    const file = bucket.file(fileName);
    // Generate signed URL that expires in 1 hour
    const signedUrl = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 3600 * 10000000000, // URL expires in 1 hour
    });
    return signedUrl[0];
}
