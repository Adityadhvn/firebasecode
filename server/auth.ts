import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { pool } from "./db"; // PostgreSQL connection pool
import db from "./db"; // Ensure db.ts correctly exports `getUserByUsername`


import connectPgSimple from "connect-pg-simple";

const PGStore = connectPgSimple(session);

const sessionSettings: session.SessionOptions = {
  secret: process.env.SESSION_SECRET!, // Enforce secret existence
  resave: false,
  saveUninitialized: false,
  store: new PGStore({
    pool: pool,
    tableName: "pg_sessions",
    schemaName: "public",
    pruneSessionInterval: 60 // Cleanup every 60 seconds
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax'
  }
};


declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("🔍 Attempting login for:", username);

        const user = await db.getUserByUsername(username);
        console.log("👤 User fetched from DB:", user);

        if (!user) {
          console.log("❌ User not found in database");
          return done(null, false, { message: "User not found" });
        }

        console.log("🔑 Validating password...");
        // Direct password comparison without hashing
        if (password !== user.password) {
          console.log("❌ Invalid password");
          return done(null, false, { message: "Invalid credentials" });
        }

        console.log("✅ Login successful:", user);
        return done(null, user);
      } catch (error) {
        console.error("🔥 Error in authentication:", error);
        return done(error);
      }
    })
  );



  passport.serializeUser((user, done) => {
    done(null, {
      id: user.id,
      username: user.username,
      email: user.email,
      isOrganizer: user.isOrganizer,
      isSuperAdmin: user.isSuperAdmin
 });
    console.log("🛠️ Storing user in session:", user);
  });




  passport.deserializeUser(async (userObj: any, done) => {
    try {
        const userId = typeof userObj === "object" ? userObj.id : userObj;

        if (typeof userId !== "number") {
            throw new Error(`Invalid user ID: ${JSON.stringify(userObj)}`);
        }

        const user = await db.getUserById(userId);
        if (!user) {
            return done(new Error("User not found"));
        }

        console.log("✅ Fetched user from DB:", user);

        // ✅ Ensure all required fields are included
        done(null, { 
            id: user.id, 
            username: user.username, 
            email: user.email,  
            fullName: user.fullName,  // ✅ Add missing field
            password: user.password,  // ✅ Add missing field (even if not used in frontend)
            isOrganizer: user.isOrganizer,  // ✅ Add missing field
            isSuperAdmin: user.isSuperAdmin 
        });

    } catch (error) {
        console.error("🔥 Error in deserializeUser:", error);
        done(error);
    }
});





  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await db.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Store the password directly without hashing
      const user = await db.createUser({
        ...req.body,
        
        password: req.body.password, // Store plain password
      });

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    console.log("👤 Sending user data:", req.user); // Debugging

    res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email, // ✅ Make sure email is included
        isSuperAdmin: req.user.isSuperAdmin
    });
});
}
