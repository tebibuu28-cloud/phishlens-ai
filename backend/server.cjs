// backend/server.cjs

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { createClient } = require("@supabase/supabase-js");

const { validateOrigin } = require("./middleware/csrfProtection.cjs");
const { verifyJwt } = require("./middleware/auth.cjs");


const app = express();

const PORT = process.env.PORT || 5000;


// ==============================
// Environment Check
// ==============================

if (!process.env.SUPABASE_URL) {
    throw new Error("Missing SUPABASE_URL");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}


// ==============================
// Supabase Admin
// ==============================

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);


// ==============================
// Middleware
// ==============================

app.use(
    helmet({
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "connect-src": [
                    "'self'",
                    "https://*.supabase.co",
                    "wss://*.supabase.co"
                ]
            }
        }
    })
);


app.use(
    cors({
        origin:
            process.env.CORS_ORIGIN ||
            "http://localhost:5173",
        credentials:true
    })
);


app.use(express.json());

app.use(cookieParser());


app.use(
    rateLimit({
        windowMs:15 * 60 * 1000,
        max:100
    })
);


// CSRF protection
app.use(validateOrigin);



// ==============================
// Health Check
// ==============================

app.get("/", (req,res)=>{
    res.json({
        status:"online",
        service:"PhishLens AI API"
    });
});



// ==============================
// Login
// ==============================

app.post("/auth/login", async(req,res)=>{

    const {
        email,
        password
    } = req.body;


    if(!email || !password){
        return res.status(400).json({
            error:"Email and password required"
        });
    }


    try {

        const {
            data,
            error
        } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });


        if(error || !data.session){

            return res.status(401).json({
                error:"Invalid credentials"
            });

        }


        const token = data.session.access_token;


        res.cookie(
            "session_token",
            token,
            {
                httpOnly:true,
                secure:false,
                sameSite:"lax",
                maxAge:7 * 24 * 60 * 60 * 1000
            }
        );


        res.json({
            message:"Logged in",
            token
        });


    } catch(err){

        console.error(
            "Login error:",
            err.message
        );

        res.status(500).json({
            error:"Server error"
        });

    }

});



// ==============================
// Logout
// ==============================

app.post("/auth/logout",(req,res)=>{

    res.clearCookie(
        "session_token"
    );

    res.json({
        message:"Logged out"
    });

});



// ==============================
// Dashboard
// ==============================

app.get(
    "/dashboard",
    verifyJwt,
    (req,res)=>{

        res.json({

            message:"Dashboard data",

            user:{
                id:req.user.id,
                email:req.user.email
            }

        });

    }
);



// ==============================
// Save History
// ==============================

app.post(
    "/api/history",
    verifyJwt,
    async(req,res)=>{


    const {
        type,
        target,
        risk_score,
        risk_level,
        threats
    } = req.body;



    if(!type || !target){

        return res.status(400).json({
            error:"Missing required fields"
        });

    }



    // Log incoming payload for debugging
    console.log('SERVER RECEIVED (POST /api/history):', JSON.stringify(req.body, null, 2));
    // Normalize threats to array of strings before inserting to DB
    const rawThreats = Array.isArray(req.body.threats) ? req.body.threats : [];
    const normalizedThreats = rawThreats.map((t) => {
        if (t === null || t === undefined) return ""
        if (typeof t === 'string') return t
        if (typeof t === 'object') return (t.reason || t.message || t.title) ? String(t.reason ?? t.message ?? t.title) : JSON.stringify(t)
        return String(t)
    });
    try{


        const insertData = {
            user_id: req.user.id,
            type,
            target,
            risk_score,
            risk_level,
            threats: normalizedThreats
        };

        console.log('SUPABASE INSERT:', JSON.stringify(insertData, null, 2));

        const { data: inserted, error: insertError } = await supabaseAdmin
            .from("analysis_history")
            .insert(insertData)
            .select();

        if (insertError) {
            throw insertError;
        }

        console.log('SUPABASE INSERT RESPONSE:', JSON.stringify(inserted, null, 2));

        res.json({
            success: true,
            inserted: inserted ?? null
        });

    } catch(err){

        console.error("History save error:", err);
        if (process.env.NODE_ENV !== "production") {
            const { message, code, details, hint } = err;
            return res.status(500).json({
                error: "Failed to save history",
                debug: { message, code, details, hint }
            });
        }

        res.status(500).json({ error: "Failed to save history" });

    }

});


// ==============================
// Get History
// ==============================

app.get(
    "/api/history",
    verifyJwt,
    async (req, res) => {


    try{

        console.log("Authorization Header:", req.headers.authorization);
        console.log("Fetching history for user ID:", req.user.id);

        const {
            data,
            error

        } = await supabaseAdmin
        .from("analysis_history")
        .select("*")
        .eq(
            "user_id",
            req.user.id
        )
        .order(
            "created_at",
            {
                ascending:false
            }
        );



        if(error){

            throw error;

        }



        // Ensure we always return an array (even if Supabase returns null)
        const safeData = data ?? [];
        console.log('SUPABASE QUERY RESULT COUNT:', safeData.length);
        console.log('GET /api/history response sample:', JSON.stringify((safeData || []).slice(0,10), null, 2));
        res.json({ history: safeData });



    }catch(err){

        console.error(
            "History fetch error:",
            err.message
        );


        res.status(500).json({
            error:"Failed to fetch history"
        });

    }

});



// ==============================
// 404
// ==============================

app.use((req,res)=>{

    res.status(404).json({
        error:"Route not found"
    });

});



// ==============================
// Start
// ==============================

app.listen(
    PORT,
    ()=>{

        console.log(
            `🚀 Backend server listening on http://localhost:${PORT}`
        );

    }
);