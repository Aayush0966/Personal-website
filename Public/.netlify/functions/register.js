const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');

exports.handler = async (event, context) => {
    try {
        const { username, email, dob, password } = JSON.parse(event.body);

        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(process.env.DB_NAME);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the Authentication collection
        await db.collection('Authentication').insertOne({ username, email, dob, password: hashedPassword });

        // Insert user profile into the Profile collection
        await db.collection('Profile').insertOne({ 
            username, 
            email, 
            dob, 
            projects: [],
            social: {
                twitter: "",
                linkedin: "",
                fb: "",
                instagram: ""
            }
        });

        // Close MongoDB connection
        client.close();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'User registered successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
