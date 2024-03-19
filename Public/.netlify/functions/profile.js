const { checkAuthenticate } = require('./authenticate');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    try {
        const token = event.headers.authorization;
        if (!token) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization token not provided or invalid' })
            };
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        console.log(userId);
        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        // Retrieve user profile using userId
        const user = await db.collection('Profile').findOne({ userId });
        client.close(); // Close MongoDB connection

        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }

        // Return user profile
        return {
            statusCode: 200,
            body: JSON.stringify(user)
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
