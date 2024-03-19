const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    try {
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization token not provided or invalid' })
            };
        }

        const token = authHeader.split(' ')[1];

        // Extract userId from the authorization token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // New email from the request body
        const { newEmail } = JSON.parse(event.body);

        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        // Update user's email based on userId
        const result = await db.collection('Profile').updateOne(
            { userId },
            { $set: { email: newEmail } }
        );

        client.close(); // Close MongoDB connection

        if (result.matchedCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email updated successfully' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
