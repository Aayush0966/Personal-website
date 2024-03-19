const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
    try {
        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        // Extract token from the request headers
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization token not provided' })
            };
        }
        const token = authHeader.split(' ')[1];

        // Verify the authentication token
        const decodedToken = jwt.verify(token, 'your-secret-key');
        const username = decodedToken.username;
        const userId = decodedToken.userId;
       
        // Delete user from Authentication collection
        await db.collection('Authentication').deleteOne({ username });

        // Delete user from Profile collection
        await db.collection('Profile').deleteOne({ userId });

        // Delete user from Finance collection
        await db.collection('Finance').deleteMany({ userId });

        // Delete user from Calendar collection
        await db.collection('Calendar').deleteMany({ userId });

        // Delete user from Tasks collection
        await db.collection('Tasks').deleteMany({ userId });

        client.close(); // Close MongoDB connection

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Account deleted successfully' })
        };
    } catch (error) {
        console.error('Error deleting account:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
