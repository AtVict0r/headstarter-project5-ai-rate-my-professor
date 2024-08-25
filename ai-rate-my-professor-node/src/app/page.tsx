'use client'

import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      parts: [{ text: "Hey there! I'm your friendly Rate My Professor support assistant. What's on your mind today?" }],
    },
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages

    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', parts: [{ text: message }] },  // Add the user's message to the chat
      { role: 'model', parts: [{ text: '' }] },  // Add a placeholder for the assistant's response
    ])

    // Send the message to the server
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', parts: [{ text: message }] }]),
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const reader = res.body.getReader()  // Get a reader to read the response body
      const decoder = new TextDecoder()  // Create a decoder to decode the response text

      let result = ''
      // Function to process the text from the response
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
          return [
            ...otherMessages,
            { ...lastMessage, parts: [{ text: lastMessage.parts[0].text + text.replace(/"/g, '') }] },  // Append the decoded text to the assistant's message
          ]
        })
        return reader.read().then(processText)  // Continue reading the next chunk of the response
      })
        .then((result) => result)
    })
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        maxWidth="50vw"
        height="90vh"
        border="1px solid black"
        borderRadius={6}
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'system' || message.role === 'model' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'system' || message.role === 'model'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                maxWidth="70%"
                borderRadius={18}
                p={3}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                {message.parts[0].text.split('\\n').map((line, index) => {
                  line = line.trim();
                  if (line.endsWith('\\n')) {
                    line = line.slice(0, -2);
                  }
                  return (
                    <ReactMarkdown>
                      {line}
                    </ReactMarkdown>
                  )
                })}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} borderRadius={12} spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: '8px', backgroundColor: 'white' }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{ borderRadius: '8px', backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}