const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');


exports.handler = async (event, context) => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        const pathSegments = event.path.split('/');
        const taskId = pathSegments[pathSegments.length - 1];

        const { status } = JSON.parse(event.body);

        const result = await db.collection('Tasks').updateOne({_id: new ObjectId(taskId)}, { $set: { status } });

        if (result.matchedCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Task not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Task updated successfully' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: 'Internal server error'
        };
    }
};
