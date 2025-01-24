export enum CircuitState {
    CLOSED,
    OPEN,
    HALF_OPEN
}

export interface CircuitBreakerOptions {
    failureThreshold: number
    resetTimeout: number
}
