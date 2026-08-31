/**
 * A callable callback function used by the event system.
 */
export type Callback = (...args: any[]) => void;

/**
 * Barebones observable and raiseable event
 */
class Event<T extends Callback> {
    #subscriptions: T[] = [];

    /**
     * Registers a callback to receive future notifications.
     *
     * @param callback The listener to subscribe.
     */
    subscribe(callback: T) {
        this.#subscriptions.push(callback);
    }

    /**
     * Remove a previously registered callback.
     *
     * @param callback The listener to unsubscribe.
     */
    unsubscribe(callback: T) {
        this.#subscriptions = this.#subscriptions.filter(c => c !== callback);
    }

    /**
     * Emit the event to all current subscribers.
     *
     * @param args Arguments forwarded to each listener.
     */
    raise(...args: Parameters<T>): void {
        for (const callback of this.#subscriptions) {
            callback(...args);
        }
    }

    /**
     * Get a read-only view of the event that cannot trigger notifications.
     */
    get unraisable() {
        return new UnraiseableEvent<T>(this);
    }
}

/**
 * Barebones observable event
 */
class UnraiseableEvent<T extends Callback> {
    #event: Event<T>;

    constructor(event: Event<T>) {
        this.#event = event;
    }

    /**
     * Register a callback to receive future notifications.
     *
     * @param callback The listener to subscribe.
     */
    subscribe(callback: T) {
        this.#event.subscribe(callback);
    }

    /**
     * Remove a previously registered callback.
     *
     * @param callback The listener to unsubscribe.
     */
    unsubscribe(callback: T) {
        this.#event.unsubscribe(callback);
    }
}

export type { Event, UnraiseableEvent };

/**
 * Creates a raiseable event with subscribe, unsubscribe, and raise capabilities.
 *
 * @template T The callback signature used by the event.
 * @returns A frozen event instance with both raiseable and unraiseable APIs.
 */
export function createEvent<T extends Callback>() {
    return new Event<T>();
}
