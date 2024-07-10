import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/connectDb";
import Faculty from '@/models/faculty';
import Student from '@/models/student'; // Assuming you have a Student model

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
          const student = await Student.findOne({ _id: userId })
          let userRole;
          let id;
          let departmentName;
          if (faculty && faculty._id.startsWith("S")) {
            id = faculty._id;
            userRole = "superadmin";
          }  else
            if (faculty) {
              id = faculty._id;
              departmentName = faculty.department;
              userRole = faculty.isAdmin ? "admin" : "faculty";
            }
            else if (student) {
              id = student._id;
              departmentName = student.department;
              userRole = "student";
            } else {
              return null;
            }

          const isVerified = (faculty && faculty.password === password) || (student && student.password === password);
          if (isVerified) {
            const userWithRole = {
              id,
              role: userRole,
              department: departmentName,
            };
            return userWithRole;
          } else {
            return null;
          }
        } catch (error) {
          console.error('Error during authorization:', error);
          return null;
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
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.department = token.department;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/", // Customize the sign-in page route as needed
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
