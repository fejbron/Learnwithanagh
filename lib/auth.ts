import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "./supabase";
import bcrypt from "bcryptjs";

// Ensure NEXTAUTH_SECRET is set
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('⚠️  NEXTAUTH_SECRET is not set. Authentication may not work properly.');
}

// Validate and get NEXTAUTH_URL
function getNextAuthUrl(): string {
  const url = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
  
  if (!url) {
    // In production, this should be set, but we'll try to construct it
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.VERCEL) {
      // Vercel provides VERCEL_URL automatically
      return `https://${process.env.VERCEL_URL || 'localhost:3000'}`;
    }
    // Fallback for development
    return process.env.NODE_ENV === 'production' 
      ? 'https://localhost:3000' // This will fail, but at least we'll get a clear error
      : 'http://localhost:3000';
  }
  
  // Validate URL format
  try {
    new URL(url);
    return url;
  } catch (e) {
    console.error('Invalid NEXTAUTH_URL:', url);
    throw new Error(`NEXTAUTH_URL is invalid: ${url}. Must be a valid absolute URL (e.g., https://your-app.vercel.app)`);
  }
}

const nextAuthUrl = getNextAuthUrl();

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
  trustHost: true,
  debug: process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Ensure cookie is available immediately
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  basePath: "/api/auth",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const result = await query(
            'SELECT * FROM "User" WHERE email = $1',
            [credentials.email as string]
          );

          if (result.rows.length === 0) {
            console.log("User not found:", credentials.email);
            return null;
          }

          const user = result.rows[0];

          // Check if password field exists and is valid
          if (!user.password) {
            console.log("User password is missing or null for:", credentials.email);
            return null;
          }

          // Ensure password is a string
          const storedPassword = String(user.password);
          
          // Check if stored password looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
          if (!storedPassword.match(/^\$2[aby]\$/)) {
            console.log("Stored password is not a valid bcrypt hash for:", credentials.email);
            console.log("Password field type:", typeof user.password);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            storedPassword
          );

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          console.log("Authentication successful for:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        console.log("JWT callback - user:", user.email);
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;
        token.role = (user as any).role;
      }
      console.log("JWT callback - returning token:", { id: token.id, email: token.email });
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token:", { id: token.id, email: token.email });
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).email = token.email as string;
        (session.user as any).name = token.name as string;
        (session.user as any).role = token.role as string;
      }
      console.log("Session callback - returning session:", session);
      return session;
    },
  },
});
