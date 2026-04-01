import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === "admin@lomda.com" && credentials?.password === "admin") {
          return { id: "1", name: "إدارة لؤلؤة العمدة", email: "admin@lomda.com", role: "admin" };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  // CRITICAL FIX: Hardcoded fallback to prevent 500 errors in Turbopack
  secret: process.env.NEXTAUTH_SECRET || "LomdaSuperSecretKey2026!@#_Fallback_Secret",
  pages: {
    signIn: "/login",
  },
  debug: true, // Enable debugging to see errors in the console
});

export { handler as GET, handler as POST };