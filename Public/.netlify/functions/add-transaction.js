const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        const token = event.headers.authorization;
        if (!token || !token.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization token not provided or invalid format' })
            };
        }

        const decodedToken = jwt.verify(token.split(' ')[1], 'your-secret-key'); // Replace 'your_secret_key' with your actual secret key used for signing tokens
        const userId = decodedToken.userId;

        const { type, amount, currentMonth } = JSON.parse(event.body);

        await db.collection('Finance').insertOne({ type, amount, currentMonth, userId });

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Transaction added successfully' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
