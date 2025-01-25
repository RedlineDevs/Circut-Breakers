import express from 'express'

const app = express()
app.use(express.json())

let shouldFail = false
let requestCount = 0

app.use((req, res, next) => {
    requestCount++
    console.log(`\n[Server] Request ${requestCount} received`)

    shouldFail = requestCount >= 5 && requestCount <= 7

    if (shouldFail) {
        console.log('[Server] Simulating server error')
    } else {
        console.log('[Server] Server healthy')
    }
    next()
})

app.get('/users/:id', (req, res) => {
    if (shouldFail) {
        res.status(500).json({ error: 'Internal Server Error' })
        return
    }

    res.json({
        id: req.params.id,
        name: 'Test User',
        email: 'test@example.com'
    })
})

app.post('/users', (req, res) => {
    if (shouldFail) {
        res.status(500).json({ error: 'Internal Server Error' })
        return
    }

    const user = req.body
    res.status(201).json({
        id: Math.floor(Math.random() * 1000),
        ...user
    })
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Mock server running on http://localhost:${PORT}`)
    console.log('Requests 5-7 will fail to demonstrate circuit breaker behavior')
})
