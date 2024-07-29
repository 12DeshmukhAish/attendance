// app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Student from '@/models/student';
import Faculty from '@/models/faculty';
import { connectMongoDB } from '@/lib/connectDb';
const SECRET_KEY = process.env.NEXTAUTH_SECRET

export async function POST(request) {
  const { _id, password, role } = await request.json();
  console.log({ _id, password, role });

  try {
    connectMongoDB()
    let user;
    if (role === 'faculty') {
      user = await Faculty.findById(_id);
    } else if (role === 'student') {
      user = await Student.findById(_id);
    } else {
      return NextResponse.json({ msg: 'Invalid role' }, { status: 400 });
    }

    console.log(user);
    if (!user) {
      return NextResponse.json({ msg: 'Invalid credentials' }, { status: 401 });
    }
    if (user.password !== password) { // In a real app, use proper password comparison
      return NextResponse.json({ msg: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ user: { id: user._id, role: role, isAdmin: user.isAdmin } }, SECRET_KEY, { expiresIn: '1h' });
    console.log(user);
    return NextResponse.json({ token, user });
  } catch (err) {
    console.error(err.message);
    return NextResponse.json({ msg: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return NextResponse.json({ msg: 'Access denied' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return NextResponse.json({ msg: 'This is protected data', user: decoded.user });
  } catch (err) {
    return NextResponse.json({ msg: 'Invalid token' }, { status: 403 });
  }
}