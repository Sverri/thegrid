import type { Event } from "./event.js";
import type { Callback } from "./types.js";

export class UnraiseableEvent<T extends Callback> {
    #event: Event<T>;

    constructor(event: Event<T>) {
        this.#event = event;
    }

    /**
     * Subscribe a callback
     */
    subscribe(callback: T) {
        this.#event.subscribe(callback);
    }

    /**
     * Unsubscribe a callback
     */
    unsubscribe(callback: T) {
        this.#event.unsubscribe(callback);
    }
}
