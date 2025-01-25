import { CircuitBreaker } from './CircuitBreaker'
import { CircuitState } from './types'

const breaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 5000
})

const mockExternalCall = async (shouldFail: boolean): Promise<string> => {
    if (shouldFail) {
        throw new Error('External service error')
    }
    return 'Success'
}

async function runTest() {
    console.log('Initial state:', CircuitState[breaker.getState()])

    try {
        await breaker.execute(() => mockExternalCall(true))
    } catch (error) {
        console.log('Failure 1:', CircuitState[breaker.getState()])
    }

    try {
        await breaker.execute(() => mockExternalCall(true))
    } catch (error) {
        console.log('Failure 2:', CircuitState[breaker.getState()])
    }

    try {
        await breaker.execute(() => mockExternalCall(true))
    } catch (error) {
        console.log('Failure 3:', CircuitState[breaker.getState()])
    }

    try {
        await breaker.execute(() => mockExternalCall(true))
    } catch (error) {
        console.log('Failure 4 (circuit open):', CircuitState[breaker.getState()])
    }

    console.log('Waiting for reset timeout...')
    await new Promise(resolve => setTimeout(resolve, 6000))
    console.log('After timeout:', CircuitState[breaker.getState()])

    try {
        const result = await breaker.execute(() => mockExternalCall(false))
        console.log('Success result:', result)
        console.log('After success:', CircuitState[breaker.getState()])
    } catch (error) {
        console.log('Unexpected error:', error)
    }
}

runTest()
