import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/connectDb";
import Faculty from '@/models/faculty';
import Student from '@/models/student';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials) {
        try {
          await connectMongoDB();
          const userId = credentials.userId;
          const password = credentials.password;
          const faculty = await Faculty.findOne({ _id: userId });
          const student = await Student.findOne({ _id: userId });
          let userRole;
          let id;
          let departmentName;

          if (!faculty && !student) {
            throw new Error('Invalid username');
          }

          if (faculty && faculty.isSuper) {
            id = faculty._id;
            userRole = "superadmin";
          } else if (faculty) {
            id = faculty._id;
            departmentName = faculty.department;
            userRole = faculty.isAdmin ? "admin" : "faculty";
          } else if (student) {
            id = student._id;
            departmentName = student.department;
            userRole = "student";
          }

          const isVerified = (faculty && faculty.password === password) || (student && student.password === password);

          if (!isVerified) {
            throw new Error('Invalid password');
          }

          const userWithRole = {
            id,
            role: userRole,
            department: departmentName,
          };
          return userWithRole;
        } catch (error) {
          console.error('Error during authorization:', error);
          throw new Error(error.message);
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.role = user.role;
        token.id = user.id;
        token.department = user.department;
        token.lastActivity = Date.now();
      } else {
        // Check if session has expired (1 hour = 3600000 milliseconds)
        const hourInMs = 3600000;
        if (Date.now() - token.lastActivity > hourInMs) {
          return null; // Session expired
        }
        token.lastActivity = Date.now(); // Update last activity
      }
      return token;
    },
    async session({ session, token }) {
      if (!token) {
        return null; // Return null if token is expired
      }
      session.user.accessToken = token.accessToken;
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.department = token.department;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 3600, // Session max age in seconds (1 hour)
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };