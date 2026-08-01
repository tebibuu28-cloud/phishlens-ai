// backend/middleware/auth.cjs

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();


const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);



async function verifyJwt(req, res, next) {


    let token;


    // Check Authorization header first
    const authHeader = req.headers.authorization;


    if (authHeader && authHeader.startsWith("Bearer ")) {

        token = authHeader.split(" ")[1];

    }


    // Fallback to cookie
    if (!token && req.cookies.session_token) {

        token = req.cookies.session_token;

    }



    if (!token) {

        return res.status(401).json({
            error:"Missing authentication token"
        });

    }



    try {


        const {
            data,
            error
        } = await supabaseAdmin.auth.getUser(token);



        if(error || !data.user){

            return res.status(401).json({
                error:"Invalid or expired token"
            });

        }



        req.user = data.user;


        next();



    } catch(err){


        console.error(
            "JWT verification failed:",
            err.message
        );


        return res.status(401).json({
            error:"Invalid token"
        });


    }

}



module.exports = {
    verifyJwt
};