// backend/middleware/auth.cjs

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();


// Supabase admin client
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);



/**
 * Verify Supabase JWT
 *
 * Supports:
 * 1. Authorization header:
 *    Bearer eyJ...
 *
 * 2. HttpOnly cookie:
 *    session_token
 */
async function verifyJwt(req, res, next) {

    let token = null;


    // --------------------------------
    // Method 1: Authorization Header
    // --------------------------------

    const authHeader = req.headers.authorization;


    if (
        authHeader &&
        authHeader.startsWith("Bearer ")
    ) {

        token = authHeader.split(" ")[1];

    }



    // --------------------------------
    // Method 2: Cookie Authentication
    // --------------------------------

    if (
        !token &&
        req.cookies &&
        req.cookies.session_token
    ) {

        token = req.cookies.session_token;

    }



    // No token found

    if (!token) {

        return res.status(401).json({

            error:
            "Missing authentication token"

        });

    }



    try {


        // Verify token with Supabase

        const {

            data,
            error

        } = await supabaseAdmin.auth.getUser(
            token
        );



        if (
            error ||
            !data.user
        ) {

            return res.status(401).json({

                error:
                "Invalid or expired token"

            });

        }



        // Attach user to request

        req.user = data.user;



        next();



    } catch (err) {


        console.error(
            "JWT verification failed:",
            err.message
        );


        return res.status(401).json({

            error:
            "Authentication failed"

        });

    }

}



module.exports = {
    verifyJwt
};