import { CircuitBreaker } from './CircuitBreaker'
import { CircuitState } from './types'

const breaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 5000
})

// Test initial state
console.log('Initial state:', CircuitState[breaker.getState()])

// Test failures until circuit opens
breaker.recordFailure()
console.log('After 1 failure:', CircuitState[breaker.getState()])

breaker.recordFailure()
console.log('After 2 failures:', CircuitState[breaker.getState()])

breaker.recordFailure()
console.log('After 3 failures:', CircuitState[breaker.getState()])

// Test reset timeout behavior
setTimeout(() => {
    console.log('After timeout:', CircuitState[breaker.getState()])

    // Try a successful call
    breaker.recordSuccess()
    console.log('After success in half-open:', CircuitState[breaker.getState()])

    // Try another failure
    breaker.recordFailure()
    console.log('After failure in closed:', CircuitState[breaker.getState()])
}, 6000)
