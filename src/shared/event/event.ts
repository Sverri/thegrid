import type { Callback } from "./types.js";
import { UnraiseableEvent } from "./unraisableevent.js";

export class Event<T extends Callback> {
    // TODO immutable
    #subscriptions: Callback[] = [];

    /**
     * Subscribe a callback
     */
    subscribe(callback: T) {
        this.#subscriptions.push(callback);
    }

    /**
     * Unsubscribe a callback
     */
    unsubscribe(callback: T) {
        for (let i = this.#subscriptions.length - 1; i >= 0; i--) {
            if (callback === this.#subscriptions[i]) {
                this.#subscriptions.splice(i, 1);
            }
        }
    }

    /**
     * Raise event, calling all subscribed callbacks
     */
    raise(...args: Parameters<T>): void {
        for (const callback of this.#subscriptions) {
            callback(...args);
        }
    }

    get unraisable(): UnraiseableEvent<T> {
        return new UnraiseableEvent<T>(this);
    }
}
