import { CircuitState, CircuitBreakerOptions } from './types'

export class CircuitBreaker {
    private state: CircuitState
    private failureCount: number
    private lastFailureTime: number
    private readonly options: CircuitBreakerOptions

    constructor(options: CircuitBreakerOptions) {
        this.state = CircuitState.CLOSED
        this.failureCount = 0
        this.lastFailureTime = 0
        this.options = options
    }

    private setState(state: CircuitState): void {
        this.state = state
    }

    private shouldReset(): boolean {
        if (this.state !== CircuitState.OPEN) {
            return false
        }
        const now = Date.now()
        return now - this.lastFailureTime >= this.options.resetTimeout
    }

    getState(): CircuitState {
        if (this.shouldReset()) {
            this.setState(CircuitState.HALF_OPEN)
        }
        return this.state
    }

    recordSuccess(): void {
        if (this.shouldReset()) {
            this.setState(CircuitState.HALF_OPEN)
        }

        this.failureCount = 0
        if (this.state === CircuitState.HALF_OPEN) {
            this.setState(CircuitState.CLOSED)
        }
    }

    recordFailure(): void {
        if (this.shouldReset()) {
            this.setState(CircuitState.HALF_OPEN)
        }

        this.failureCount++
        this.lastFailureTime = Date.now()

        if (this.state === CircuitState.CLOSED &&
            this.failureCount >= this.options.failureThreshold) {
            this.setState(CircuitState.OPEN)
        } else if (this.state === CircuitState.HALF_OPEN) {
            this.setState(CircuitState.OPEN)
        }
    }

    isOpen(): boolean {
        if (this.shouldReset()) {
            this.setState(CircuitState.HALF_OPEN)
            return false
        }
        return this.state === CircuitState.OPEN
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.isOpen()) {
            throw new Error('Circuit breaker is open')
        }

        try {
            const result = await fn()
            this.recordSuccess()
            return result
        } catch (error) {
            this.recordFailure()
            throw error
        }
    }
}
