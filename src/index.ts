import { CircuitBreaker } from './CircuitBreaker'
import { CircuitState } from './types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockExternalCall = async (shouldFail: boolean, latencyMs = 0): Promise<string> => {
    await delay(latencyMs)
    if (shouldFail) {
        throw new Error('External service error')
    }
    return 'Success'
}

async function runTests() {
    console.log('Starting comprehensive circuit breaker tests...\n')

    const breaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 5000
    })

    breaker.onStateChange(event => {
        console.log(`[Event] State changed from ${CircuitState[event.previousState]} to ${CircuitState[event.currentState]}`)
        console.log(`[Event] Current failure count: ${event.failureCount}\n`)
    })

    async function testCase(name: string, fn: () => Promise<void>) {
        console.log(`\n=== Test Case: ${name} ===`)
        try {
            await fn()
            console.log(`✓ ${name} completed\n`)
        } catch (error) {
            console.error(`✗ ${name} failed:`, error, '\n')
        }
    }

    await testCase('Initial State', async () => {
        const state = breaker.getState()
        console.log('Initial state:', CircuitState[state])
        if (state !== CircuitState.CLOSED) throw new Error('Initial state should be CLOSED')
    })

    await testCase('Successful Calls', async () => {
        const result = await breaker.execute(() => mockExternalCall(false))
        console.log('Success result:', result)
        if (result !== 'Success') throw new Error('Expected successful call')
        if (breaker.getState() !== CircuitState.CLOSED) throw new Error('Should remain CLOSED after success')
    })

    await testCase('Failure Count Below Threshold', async () => {
        try {
            await breaker.execute(() => mockExternalCall(true))
        } catch (error) {
            console.log('Expected failure handled')
        }
        if (breaker.getState() !== CircuitState.CLOSED) throw new Error('Should remain CLOSED below threshold')
    })

    await testCase('Circuit Opens After Threshold', async () => {
        for (let i = 0; i < 3; i++) {
            try {
                await breaker.execute(() => mockExternalCall(true))
            } catch (error) {
                console.log(`Failure ${i + 1} handled`)
            }
        }
        if (breaker.getState() !== CircuitState.OPEN) throw new Error('Should be OPEN after threshold')
    })

    await testCase('Reject Calls When Open', async () => {
        try {
            await breaker.execute(() => mockExternalCall(false))
            throw new Error('Should not execute when circuit is open')
        } catch (error) {
            console.log('Correctly rejected call in OPEN state')
        }
    })

    await testCase('Transition to Half-Open After Timeout', async () => {
        console.log('Waiting for reset timeout...')
        await delay(6000)
        const state = breaker.getState()
        console.log('State after timeout:', CircuitState[state])
        if (state !== CircuitState.HALF_OPEN) throw new Error('Should be HALF-OPEN after timeout')
    })

    await testCase('Failure in Half-Open State', async () => {
        try {
            await breaker.execute(() => mockExternalCall(true))
        } catch (error) {
            console.log('Failure in HALF-OPEN handled')
        }
        if (breaker.getState() !== CircuitState.OPEN) throw new Error('Should be OPEN after failure in HALF-OPEN')
    })

    await testCase('Success After Reset', async () => {
        await delay(6000)
        const result = await breaker.execute(() => mockExternalCall(false))
        console.log('Success after reset:', result)
        if (breaker.getState() !== CircuitState.CLOSED) throw new Error('Should be CLOSED after success')
    })
}

console.log('Running circuit breaker tests...\n')
runTests().catch(console.error)
