const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
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
        const { currentPassword, newPassword } = JSON.parse(event.body);

        // Extract userId from the authorization token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        // Retrieve user's hashed password from the database
        const user = await db.collection('Authentication').findOne({_id: new ObjectId(userId)});
        if (!user) {
            client.close();
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }

        // Compare the current password provided by the user with the hashed password stored in the database
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            client.close();
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Current password is incorrect' })
            };
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await db.collection('Authentication').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { password: hashedPassword } }
        );

        client.close(); // Close MongoDB connection

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Password updated successfully' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
