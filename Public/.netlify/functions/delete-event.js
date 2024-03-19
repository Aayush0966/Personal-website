const { MongoClient, ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
    try {
        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        // Extract eventId from the request URL
        const pathSegments = event.path.split('/');
        const eventId = pathSegments[pathSegments.length - 1];
 
        // Delete the event from the database
        const result = await db.collection('Calendar').deleteOne({ _id: new ObjectId(eventId) });

        client.close(); // Close MongoDB connection
        console.log(result);
        if (result.deletedCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Event not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Event deleted successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
