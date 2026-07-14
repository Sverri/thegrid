import { List } from "immutable";

/**
 * A callable callback function used by the event system.
 */
export type Callback = (...args: any[]) => void;

/**
 * A simple event interface that supports subscribing and unsubscribing listeners.
 *
 * The event can be observed but cannot be raised directly.
 */
export interface UnraiseableEvent<T extends Callback> {
    /**
     * Registers a callback to receive future notifications.
     *
     * @param callback The listener to subscribe.
     */
    subscribe: (callback: T) => void;

    /**
     * Removes a previously registered callback.
     *
     * @param callback The listener to unsubscribe.
     */
    unsubscribe: (callback: T) => void;
}

/**
 * An event that can be raised and also exposes an unraiseable view.
 */
export interface RaiseableEvent<T extends Callback> extends UnraiseableEvent<T> {
    /**
     * Emits the event to all current subscribers.
     *
     * @param args Arguments forwarded to each listener.
     */
    raise: (...args: Parameters<T>) => void;

    /**
     * Gets a read-only view of the event that cannot trigger notifications.
     */
    get unraisable(): UnraiseableEvent<T>;
}

/**
 * Creates a raiseable event with subscribe, unsubscribe, and raise capabilities.
 *
 * @template T The callback signature used by the event.
 * @returns A frozen event instance with both raiseable and unraiseable APIs.
 */
export function createEvent<T extends Callback>(): RaiseableEvent<T> {
    let subscriptions = List<Callback>();

    function subscribe(callback: T) {
        subscriptions = subscriptions.push(callback);
    }

    function unsubscribe(callback: T) {
        subscriptions = subscriptions.filter(sub => sub !== callback);
    }

    function raise(...args: Parameters<T>): void {
        for (const callback of subscriptions) {
            callback(...args);
        }
    }

    return Object.freeze({
        subscribe,
        unsubscribe,
        raise,
        get unraisable(): UnraiseableEvent<T> {
            return Object.freeze({ subscribe, unsubscribe });
        },
    });
}
