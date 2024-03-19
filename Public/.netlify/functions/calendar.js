const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
    try {
        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        // Extract the authorization token from the request headers
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization token not provided' })
            };
        }

        const token = authHeader.split(' ')[1]; // Extract the token part after "Bearer "
        
        // Verify and decode the JWT token to get the userId
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Fetch calendar events for the specified userId
        const calendarEvents = await db.collection('Calendar').find({ userId }).toArray();

        client.close(); // Close MongoDB connection

        return {
            statusCode: 200,
            body: JSON.stringify(calendarEvents)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
