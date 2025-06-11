Jugaad Session (In-Memory) Approach:
    1. Creating a global empty array called sessions to store user sessions.
    2. On the first request (like GET /courses), checking if a sessionID cookie exists.
        -> If not found, generating a new ObjectId.
        -> Setting this ID as a cookie in the user’s browser.
        -> Adding a new session object with sessionID and empty cart to the sessions array.
    3. On every cart-related request, checking the sessionID from the cookie.
    4. Using a middleware (checkSession) to:
        -> Read the sessionID from cookies.
        -> Find the matching session from the global array.
        -> Attach the session to req.userSession.
    5. On GET /cart, returning the cart from req.userSession.
    6. For add/remove/clear actions, updating the cart inside req.userSession.