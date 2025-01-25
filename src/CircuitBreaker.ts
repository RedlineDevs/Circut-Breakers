import { CircuitState, CircuitBreakerOptions, CircuitBreakerEvent, StateChangeListener } from './types'

export class CircuitBreaker {
    private state: CircuitState
    private failureCount: number
    private lastFailureTime: number
    private readonly options: CircuitBreakerOptions
    private listeners: Set<StateChangeListener>

    constructor(options: CircuitBreakerOptions) {
        this.state = CircuitState.CLOSED
        this.failureCount = 0
        this.lastFailureTime = 0
        this.options = options
        this.listeners = new Set()
    }

    private setState(newState: CircuitState): void {
        if (this.state === newState) {
            return
        }

        const previousState = this.state
        this.state = newState

        const event: CircuitBreakerEvent = {
            previousState,
            currentState: newState,
            timestamp: Date.now(),
            failureCount: this.failureCount
        }

        this.notifyListeners(event)
    }

    private notifyListeners(event: CircuitBreakerEvent): void {
        this.listeners.forEach(listener => {
            try {
                listener(event)
            } catch (error) {
                console.error('Error in circuit breaker listener:', error)
            }
        })
    }

    onStateChange(listener: StateChangeListener): () => void {
        this.listeners.add(listener)
        return () => {
            this.listeners.delete(listener)
        }
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
        this.failureCount++
        this.lastFailureTime = Date.now()

        if (this.state === CircuitState.HALF_OPEN ||
            (this.state === CircuitState.CLOSED &&
             this.failureCount >= this.options.failureThreshold)) {
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
