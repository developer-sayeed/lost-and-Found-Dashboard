import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

const DEFAULT_SETTINGS = {
  hotelName: 'Warwick Hotels and Resorts',
  hotelAddress: '',
  hotelPhone: '',
  hotelEmail: '',
  hotelWebsite: '',
  logo: '/images/warwick-logo.png',
  otherLinks: [],
}

// GET settings
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    let settings = await db.collection('settings').findOne({ key: 'hotel_settings' })
    
    if (!settings) {
      // Create default settings
      await db.collection('settings').insertOne({
        key: 'hotel_settings',
        ...DEFAULT_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      settings = { key: 'hotel_settings', ...DEFAULT_SETTINGS }
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT update settings
export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()
    
    const updateData = {
      ...body,
      updatedAt: new Date(),
    }
    
    await db.collection('settings').updateOne(
      { key: 'hotel_settings' },
      { $set: updateData },
      { upsert: true }
    )
    
    const settings = await db.collection('settings').findOne({ key: 'hotel_settings' })
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
