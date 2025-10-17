import { NextRequest, NextResponse } from 'next/server'
import DatabaseManager from '@/lib/database'

// GET user memory for a specific user and domain
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

        const userMemory = await DatabaseManager.getUserMemory(domain, userId)

        return NextResponse.json({
            userMemory,
            found: !!userMemory
        })

    } catch (error) {
        console.error('Error fetching user memory:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user memory' },
            { status: 500 }
        )
    }
}

// POST update user memory
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, domain, workingMemory } = body

        if (!userId || !domain || !workingMemory) {
            return NextResponse.json(
                { error: 'User ID, domain, and working memory are required' },
                { status: 400 }
            )
        }

        const success = await DatabaseManager.updateUserMemory(domain, userId, workingMemory)

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to update user memory' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'User memory updated successfully'
        })

    } catch (error) {
        console.error('Error updating user memory:', error)
        return NextResponse.json(
            { error: 'Failed to update user memory' },
            { status: 500 }
        )
    }
}
