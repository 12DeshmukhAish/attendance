import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { connectMongoDB } from "@/lib/connectDb"
import Faculty from '@/models/faculty'
import Student from '@/models/student'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        try {
          await connectMongoDB()
          const userId = credentials.userId
          const password = credentials.password

          const faculty = await Faculty.findOne({ _id: userId })
          const student = await Student.findOne({ _id: userId })

          if (!faculty && !student) {
            throw new Error('User not found')
          }

          let user
          if (faculty) {
            user = faculty
          } else if (student) {
            user = student
          }

          if (user.password !== password) {
            throw new Error('Invalid password')
          }

          let role
          if (faculty) {
            role = faculty.isSuper ? "superadmin" : (faculty.isAdmin ? "admin" : "faculty")
          } else {
            role = "student"
          }

          // Create a profile object with all necessary user information
          const profile = {
            id: user._id,
            role,
            department: user.department,
            name: user.name,
            email: user.email,
            // Add any other relevant fields from the user document
          }

          return profile
        } catch (error) {
          console.error('Error during authorization:', error)
          throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred')
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user
      return session
    }
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }