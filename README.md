# Circuit Breaker

A TypeScript implementation of the Circuit Breaker pattern that I built to handle failures gracefully in distributed systems. I created this mainly as a side project.

## Why I Built This

bc why not?

## Features

- Brain-dead code
- State management (Closed, Open, Half-Open)
- Event-based state change notifications
- Configurable failure thresholds
- Automatic recovery attempts
- Promise-based API
- Bald code

## Installation

```bash
git clone https://github.com/RedlineDevs/Circut-Breakers.git
cd Circut-Breakers
yarn install
```

## Quick Start

```typescript
import { CircuitBreaker } from './src/CircuitBreaker'

// Create a circuit breaker instance
const breaker = new CircuitBreaker({
    failureThreshold: 3,    // Number of failures before opening
    resetTimeout: 5000      // Time in ms before attempting recovery
})

// Wrap your function calls
try {
    const result = await breaker.execute(async () => {
        return await fetch('https://api.example.com/data')
    })
} catch (error) {
    if (error.message === 'Circuit breaker is open') {
        console.log('Service is unavailable, try again later')
    } else {
        console.log('Request failed:', error)
    }
}

// Monitor state changes
breaker.onStateChange(event => {
    console.log(`Circuit changed from ${event.previousState} to ${event.currentState}`)
    console.log(`Current failure count: ${event.failureCount}`)
})
```

## How It Works

The circuit breaker works like an electrical circuit breaker (hence the name):

1. **CLOSED State (Normal Operation)**
   - All calls pass through normally
   - Failures are counted
   - After `failureThreshold` consecutive failures, switches to OPEN

2. **OPEN State (Failure Prevention)**
   - All calls fail fast without hitting the service
   - After `resetTimeout` milliseconds, switches to HALF-OPEN

3. **HALF-OPEN State (Recovery Testing)**
   - Allows one test call through
   - Success switches to CLOSED
   - Failure switches back to OPEN

## Development

```bash
# Install dependencies
yarn install

# Run tests
yarn dev

# Try the HTTP API example
ts-node examples/mock-server.ts  # Terminal 1
ts-node examples/http-api.ts     # Terminal 2
```

## Examples

Check out the `examples/` directory for:
- HTTP API integration (`http-api.ts`)
- Mock server for testing (`mock-server.ts`)

Building this helped me understand:
- The importance of proper state management
- How to design clean, type-safe APIs
- The value of comprehensive testing
- Real-world applications of the circuit breaker pattern
- How I was able to go bald, just from all the braincells I've lost

## Future Improvements

I'm thinking about adding:
- Success threshold in half-open state
- Sliding window for failure counting
- Metrics collection
- Circuit breaker groups/clustering
- More braincells to my brain but pretty sure trying to grow them back while coding wont work out good

## License

MIT - Feel free to use this in your own projects! i dont care
