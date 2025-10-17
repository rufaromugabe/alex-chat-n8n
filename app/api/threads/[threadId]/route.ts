import { NextRequest, NextResponse } from 'next/server'
import DatabaseManager from '@/lib/database'

// GET a specific thread
export async function GET(
    request: NextRequest,
    { params }: { params: { threadId: string } }
) {
    try {
        const { threadId } = params
        const { searchParams } = new URL(request.url)
        const domain = searchParams.get('domain') || 'general'

        if (!threadId) {
            return NextResponse.json(
                { error: 'Thread ID is required' },
                { status: 400 }
            )
        }

        const thread = await DatabaseManager.getThread(domain, threadId)

        if (!thread) {
            return NextResponse.json(
                { error: 'Thread not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ thread })

    } catch (error) {
        console.error('Error fetching thread:', error)
        return NextResponse.json(
            { error: 'Failed to fetch thread' },
            { status: 500 }
        )
    }
}

// DELETE a specific thread
export async function DELETE(
    request: NextRequest,
    { params }: { params: { threadId: string } }
) {
    try {
        const { threadId } = params
        const { searchParams } = new URL(request.url)
        const domain = searchParams.get('domain') || 'general'

        if (!threadId) {
            return NextResponse.json(
                { error: 'Thread ID is required' },
                { status: 400 }
            )
        }

        // Delete thread from database (you'll need to add this method to DatabaseManager)
        const success = await DatabaseManager.deleteThread(domain, threadId)

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete thread' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error deleting thread:', error)
        return NextResponse.json(
            { error: 'Failed to delete thread' },
            { status: 500 }
        )
    }
}
