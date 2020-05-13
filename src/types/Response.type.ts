export interface SuccessResponseJSON<T> {
    result: T
}

export interface ErrorResponseJSON {
    /**
     * A description of what went wrong.
     * @example Oh no! Something went wrong!
     */
    error: string
}
