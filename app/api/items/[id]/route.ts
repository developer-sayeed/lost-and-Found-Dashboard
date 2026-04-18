import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET single item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await params
    
    const item = await db.collection('items').findOne({ _id: new ObjectId(id) })
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}

// PUT update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await params
    const body = await request.json()
    
    // Remove id from body if present
    const { id: _, ...updateData } = body
    
    // Handle date conversions
    if (updateData.dateFound) {
      updateData.dateFound = new Date(updateData.dateFound)
    }
    if (updateData.dispatchDeadline) {
      updateData.dispatchDeadline = new Date(updateData.dispatchDeadline)
    }
    if (updateData.handoverDate) {
      updateData.handoverDate = new Date(updateData.handoverDate)
    }
    if (updateData.dispatchedDate) {
      updateData.dispatchedDate = new Date(updateData.dispatchedDate)
    }
    
    updateData.updatedAt = new Date()
    
    const result = await db.collection('items').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    const updatedItem = await db.collection('items').findOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({
      ...updatedItem,
      id: updatedItem?._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

// DELETE item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await params
    
    const result = await db.collection('items').deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
