import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export function middleware(NextRequest) {
  const response = NextResponse.next()

  // Add the CORS headers to the response
  response.headers.append('Access-Control-Allow-Credentials', "true")
  response.headers.append('Access-Control-Allow-Origin', '*') // In production, replace * with your React Native app's URL
  response.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
  response.headers.append('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  return response
}

export const config = {
  matcher: '/api/:path*',
}