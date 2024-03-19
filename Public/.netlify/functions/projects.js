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

        const { name } = JSON.parse(event.body);

        const result = await db.collection('Profile').updateOne(
            { userId: userId },
            { $push: { projects: { name: name } } }
        );

        if (result.modifiedCount !== 1) {
            throw new Error('Failed to add project');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Project added successfully' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
