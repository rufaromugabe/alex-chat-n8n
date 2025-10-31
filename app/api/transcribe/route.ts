import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            )
        }

        const formData = await request.formData()
        const audioFile = formData.get('audio') as File

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            )
        }

        // Convert File to a format OpenAI SDK can handle
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'gpt-4o-transcribe',
        })

        return NextResponse.json({ text: transcription.text })

    } catch (error) {
        console.error('Transcription error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}