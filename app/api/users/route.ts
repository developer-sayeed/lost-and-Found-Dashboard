import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET all users
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    const users = await db.collection('users').find({}).toArray()
    
    // Transform MongoDB _id to id
    const transformedUsers = users.map(user => ({
      ...user,
      id: user._id.toString(),
      _id: undefined,
    }))
    
    return NextResponse.json({ users: transformedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()
    
    // Check if email already exists
    const existingUser = await db.collection('users').findOne({ email: body.email })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    
    const newUser = {
      ...body,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection('users').insertOne(newUser)
    
    return NextResponse.json({
      ...newUser,
      id: result.insertedId.toString(),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
