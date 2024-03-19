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

        const { name, status } = JSON.parse(event.body);

        const result = await db.collection('Tasks').insertOne({ name, status, userId });

        const newTask = await db.collection('Tasks').findOne({ _id: result.insertedId });

        return {
            statusCode: 201,
            body: JSON.stringify(newTask)
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: 'Internal server error'
        };
    }
};
