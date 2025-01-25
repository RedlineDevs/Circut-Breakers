import { CircuitBreaker } from '../src/CircuitBreaker'
import { CircuitState } from '../src/types'

const API_BASE = 'http://localhost:3000'

class ExternalApiService {
    private breaker: CircuitBreaker

    constructor() {
        this.breaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 10000
        })

        this.breaker.onStateChange(event => {
            console.log(`\n[Event] Circuit Breaker: ${CircuitState[event.previousState]} -> ${CircuitState[event.currentState]}`)
            console.log(`[Event] Failure count: ${event.failureCount}`)
            if (event.currentState === CircuitState.OPEN) {
                console.log('[Event] Circuit is now open - fast failing all requests')
            } else if (event.currentState === CircuitState.HALF_OPEN) {
                console.log('[Event] Circuit is testing the service with limited requests')
            } else {
                console.log('[Event] Circuit is closed - service is healthy')
            }
        })
    }

    async fetchUserData(userId: string): Promise<any> {
        return this.breaker.execute(async () => {
            const response = await fetch(`${API_BASE}/users/${userId}`)
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }
            return response.json()
        })
    }

    async createUser(userData: any): Promise<any> {
        return this.breaker.execute(async () => {
            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }
            return response.json()
        })
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function demo() {
    console.log('Starting circuit breaker demonstration...\n')
    const api = new ExternalApiService()

    for (let i = 1; i <= 20; i++) {
        console.log(`\nRequest ${i}:`)
        try {
            const user = await api.fetchUserData('123')
            console.log('Success:', user)
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === 'Circuit breaker is open') {
                    console.log('Circuit is open - request blocked')
                } else {
                    console.log('Request failed:', error.message)
                }
            }
        }

        await sleep(i % 5 === 0 ? 3000 : 1000)
    }
}

if (require.main === module) {
    console.log('Press Ctrl+C to stop the demo')
    demo().catch(console.error)
}
