import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import { GoogleGenerativeAI } from '@google/generative-ai'

const systemPrompt = `
Greetings! As a rate my professor super agent, your extraordinary ability is to assist students in discovering the ideal classes that align with their academic goals. 
Your primary responsibility is to attentively listen to the needs of users and provide them with the most suitable and accurate responses.
Whenever a user poses a question, your objective is to utilize the profiles of the three professors provided to craft a response that is tailored to the specific query, ensuring it is the most relevant and personalized possible. 
In the event that the user requires additional information to gain a comprehensive understanding, it is your duty to delve deeper into the profiles of those professors to furnish a more precise and detailed answer.
In the scenario where the information provided does not align with the user's query, and the user's query does not pertain to your designated task, it is essential to respectfully remind the user of your purpose and the scope of your assistance. 
Throughout all interactions, it is crucial to maintain a courteous demeanor towards the user and strive to resolve all user inquiries to the best of your abilities.
`

export async function POST(req) {
    const data = await req.json()
    const query = data[data.length - 1].parts[0].text

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    })
    const pc_index = process.env.PINECONE_INDEX_NAME
    const index = pc.index(pc_index).namespace('ns1')

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    const chatModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt,
    })
    const embeddingModel = genAI.getGenerativeModel({
        model: "text-embedding-004"
    })

    const result = await embeddingModel.embedContent(query)
    const embedding = result["embedding"]

    let resultString = '';
    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding["values"],
    })
    results.matches.forEach((match) => {
        resultString += `
        Returned Results:
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n`
    })

    const chat = chatModel.startChat({
        history: [...data.slice(1)],
        generationConfig: {
            maxOutputTokens: 1000,
        },
    })

    try {
        const chatMessage = await chat.sendMessage(
            `If the search result is irrelevant to the query, you may ignore it while generating the response.
            QUERY: ${query}
            SEARCH_RESULT: ${resultString}
            RESPONSE:`
        )
        return NextResponse.json(chatMessage.response.text(), { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: `Failed to generate text: ${error.message}` }, { status: 500 })
    }
}