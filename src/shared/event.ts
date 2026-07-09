import { List } from "immutable";

export type Callback = (...args: any[]) => void;

export interface UnraiseableEvent<T extends Callback> {
    subscribe: (callback: T) => void;
    unsubscribe: (callback: T) => void;
}

export interface RaiseableEvent<T extends Callback> extends UnraiseableEvent<T> {
    raise: (...args: Parameters<T>) => void;
    get unraisable(): UnraiseableEvent<T>;
}

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
