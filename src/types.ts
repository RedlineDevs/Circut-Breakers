export enum CircuitState {
    CLOSED,
    OPEN,
    HALF_OPEN
}

export interface CircuitBreakerOptions {
    failureThreshold: number
    resetTimeout: number
}

export type CircuitBreakerEvent = {
    previousState: CircuitState
    currentState: CircuitState
    timestamp: number
    failureCount: number
}

export type StateChangeListener = (event: CircuitBreakerEvent) => void
