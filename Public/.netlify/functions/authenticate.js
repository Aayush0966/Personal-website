const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    try {
        // Retrieve the JWT token from the Authorization header
        const token = event.headers.authorization;
        if (!token) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        // Retrieve the requested accountId from the request cookie
        const requestedAccountId = event.headers.cookie.replace(/(?:(?:^|.*;\s*)accountId\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        // Remove 'Bearer ' from the token header to get only the token string
        const tokenString = token.split(' ')[1];

        // Verify the JWT token
        const decodedToken = jwt.verify(tokenString, process.env.JWT_SECRET);

        // Retrieve the accountId and username from the token payload
        const tokenAccountId = decodedToken.accountId;
        const username = decodedToken.username;

        // Check if the requested cookie value and the cookie value inside the token match
        if (requestedAccountId !== tokenAccountId) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        // If the token is valid, return authenticated status and username
        return { statusCode: 200, body: JSON.stringify({ authenticated: true, username }) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
    }
};
