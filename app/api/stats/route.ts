import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Get counts by status
    const statusCounts = await db.collection('items').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    
    // Get counts by category
    const categoryCounts = await db.collection('items').aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    
    // Calculate totals
    const total = statusCounts.reduce((sum, s) => sum + s.count, 0)
    const stored = statusCounts.find(s => s._id === 'stored')?.count || 0
    const handedOver = statusCounts.find(s => s._id === 'handed_over')?.count || 0
    const dispatched = statusCounts.find(s => s._id === 'dispatched')?.count || 0
    
    // Get pending dispatch count (items within 3 days of deadline)
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    
    const pendingDispatch = await db.collection('items').countDocuments({
      status: 'stored',
      dispatchDeadline: { $lte: threeDaysFromNow }
    })
    
    // Transform for charts
    const statusData = statusCounts.map(s => ({
      name: s._id === 'stored' ? 'Stored' : s._id === 'handed_over' ? 'Handed Over' : 'Dispatched',
      value: s.count,
      status: s._id
    }))
    
    const categoryData = categoryCounts.map(c => ({
      name: c._id || 'Unknown',
      value: c.count
    }))
    
    return NextResponse.json({
      total,
      stored,
      handedOver,
      dispatched,
      pendingDispatch,
      statusData,
      categoryData
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
