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
// Environment Validation
// ==============================

if (!process.env.SUPABASE_URL) {
    throw new Error("Missing SUPABASE_URL in .env");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
}


// ==============================
// Supabase Admin Client
// ==============================

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);


// ==============================
// Security Middleware
// ==============================

app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);


app.use(
    cors({
        origin:
            process.env.CORS_ORIGIN ||
            "http://localhost:5173",
        credentials: true
    })
);


app.use(express.json());

app.use(cookieParser());


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Too many requests, try again later"
    }
});

app.use(limiter);


// CSRF / Origin protection
app.use(validateOrigin);


// ==============================
// Health Check
// ==============================

app.get("/", (req, res) => {
    res.json({
        status: "online",
        service: "PhishLens AI API"
    });
});


// ==============================
// Authentication
// ==============================

app.post("/auth/login", async (req, res) => {

    const {
        email,
        password
    } = req.body;


    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password required"
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


        if (error || !data.session) {

            return res.status(401).json({
                error: "Invalid credentials"
            });

        }


        const token = data.session.access_token;


        // Secure HttpOnly cookie
        res.cookie(
            "session_token",
            token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 7
            }
        );


        res.json({
            message: "Logged in"
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



// Logout

app.post("/auth/logout",(req,res)=>{

    res.clearCookie(
        "session_token"
    );

    res.json({
        message:"Logged out"
    });

});



// ==============================
// Protected Routes
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
// 404 Handler
// ==============================

app.use((req,res)=>{

    res.status(404).json({
        error:"Route not found"
    });

});



// ==============================
// Error Handler
// ==============================

app.use(
    (err,req,res,next)=>{

        console.error(err);

        res.status(500).json({
            error:"Internal server error"
        });

    }
);



// ==============================
// Start Server
// ==============================

app.listen(PORT,()=>{

    console.log(
        `🚀 Backend server listening on http://localhost:${PORT}`
    );

});