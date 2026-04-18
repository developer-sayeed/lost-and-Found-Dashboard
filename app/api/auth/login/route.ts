import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// Default super admin credentials
const DEFAULT_SUPER_ADMIN = {
  email: 'abusayeedriday@gmail.com',
  password: '587710',
  name: 'Super Admin',
  role: 'super_admin' as const,
  isActive: true,
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { email, password } = await request.json()
    
    // Check for default super admin
    if (email === DEFAULT_SUPER_ADMIN.email && password === DEFAULT_SUPER_ADMIN.password) {
      // Check if super admin exists in DB, if not create it
      let superAdmin = await db.collection('users').findOne({ email: DEFAULT_SUPER_ADMIN.email })
      
      if (!superAdmin) {
        const result = await db.collection('users').insertOne({
          ...DEFAULT_SUPER_ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        superAdmin = {
          ...DEFAULT_SUPER_ADMIN,
          _id: result.insertedId,
        }
      }
      
      return NextResponse.json({
        user: {
          id: superAdmin._id.toString(),
          email: superAdmin.email,
          name: superAdmin.name,
          role: superAdmin.role,
          isActive: superAdmin.isActive,
        }
      })
    }
    
    // Find user in database
    const user = await db.collection('users').findOne({ email, password })
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 })
    }
    
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      }
    })
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
