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
