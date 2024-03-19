exports.handler = async (event, context) => {
    try {
        // Clear the cookies
        const response = {
            statusCode: 200,
            headers: {
                'Set-Cookie': 'accountId=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Logout successful' })
        };

        return response;
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to logout' })
        };
    }
};
