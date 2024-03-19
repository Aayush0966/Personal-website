const { MongoClient, ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
    try {
        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        // Parse the event body
        const eventData = JSON.parse(event.body);

        // Extract event details from the request body
        const { id, title, date, time } = eventData;

        // Update the event in the database
        const result = await db.collection('Calendar').updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, date, time } }
        );

        client.close(); // Close MongoDB connection

        if (result.matchedCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Event not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Event updated successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
