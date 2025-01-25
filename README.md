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
        // Your async operation here
        return await someApiCall()
    })
} catch (error) {
    // Handle the error
}

// Listen to state changes
breaker.onStateChange(event => {
    console.log(`Circuit changed from ${event.previousState} to ${event.currentState}`)
})
```

## How It Works

The circuit breaker works like an electrical circuit breaker (hence the name):

1. In normal operation, it's CLOSED and calls pass through
2. When failures hit the threshold, it OPENS and fast-fails calls
3. After a timeout, it goes HALF-OPEN to test if the problem is fixed
4. Success in HALF-OPEN closes the circuit; failure opens it again

## Development

```bash
# Install dependencies
yarn

# Run tests
yarn dev
```

## What I Learned

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
