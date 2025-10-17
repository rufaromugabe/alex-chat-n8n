import { NextRequest, NextResponse } from 'next/server'
import DatabaseManager from '@/lib/database'

// GET all threads for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const domain = searchParams.get('domain') || 'general'

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        const threads = await DatabaseManager.getUserThreads(domain, userId)

        return NextResponse.json({
            threads,
            total_count: threads.length
        })

    } catch (error) {
        console.error('Error fetching threads:', error)
        return NextResponse.json(
            { error: 'Failed to fetch threads' },
            { status: 500 }
        )
    }
}

// POST create or update a thread
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { domain, threadId, userId, title, lastMessage, messageCount, workingMemory } = body

        if (!domain || !threadId || !userId || !title) {
            return NextResponse.json(
                { error: 'Domain, Thread ID, User ID, and title are required' },
                { status: 400 }
            )
        }

        const success = await DatabaseManager.upsertThread(
            domain,
            threadId,
            userId,
            title,
            lastMessage || '',
            messageCount || 0,
            workingMemory || {}
        )

        if (success) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json(
                { error: 'Failed to save thread' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Error saving thread:', error)
        return NextResponse.json(
            { error: 'Failed to save thread' },
            { status: 500 }
        )
    }
}
