const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    try {
        const { username, password } = JSON.parse(event.body);

        // Get accountId from request cookie
        const accountId = event.headers.cookie.replace(/(?:(?:^|.*;\s*)accountId\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        // Check if user exists
        const user = await db.collection('Authentication').findOne({ username: username });
        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        // Add accountId to the JWT payload
        const tokenPayload = { 
            userId: user._id, 
            username: user.username, // Include username in the JWT payload
            accountId: accountId // Include accountId in the JWT payload
        };

        // Generate JWT token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Close MongoDB connection
        client.close();

        // Set session cookie with accountId from request
        const cookie = `accountId=${accountId}; Path=/; HttpOnly; Secure; SameSite=Strict`;
        await db.collection('Profile').updateOne({ username: username }, { $set: { userId: user._id.toString() } });

        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': cookie,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, accountId })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
