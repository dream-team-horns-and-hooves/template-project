type Unsubscribe = () => void;
type Listener<V> = (value: V) => any;

interface Emitter<Events, Key extends keyof Events = keyof Events> {
    on<K extends Key = Key>(event: K, listener: Listener<Events[K]>): Unsubscribe;

    once<K extends Key>(event: K, listener: Listener<Events[K]>): Unsubscribe;

    emit<K extends Key = Key>(event: K, value: Events[K]): void;

    emitCallback<K extends Key = Key>(event: K): (value: Events[K]) => void;

    off(event: Key): void;
}

export class EventEmitter<Events, Key extends keyof Events = keyof Events> implements Emitter<Events, Key> {
    private listeners: Map<Key, Set<Listener<Events[Key]>>> = new Map();

    public on<K extends Key = Key>(event: K, listener: Listener<Events[K]>): Unsubscribe {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        const found = this.listeners.get(event);

        if (found) {
            found.add(listener as Listener<Events[Key]>);
        }

        return () => {
            const exists = this.listeners.get(event);

            if (exists) {
                exists.delete(listener as Listener<Events[Key]>);
            }
        };
    }

    public once<K extends Key>(event: K, listener: Listener<Events[K]>): Unsubscribe {
        const unsubscribe = this.on(event, value => {
            listener(value);
            unsubscribe();
        });
        return unsubscribe;
    }

    public emit<K extends Key = Key>(event: K, value?: Events[K]): void {
        const listeners = this.listeners.get(event);

        if (listeners) {
            listeners.forEach(fn => fn(value));
        }
    }

    public emitCallback<K extends Key = Key>(event: K): (value: Events[K]) => void {
        return value => this.emit(event, value);
    }

    public off(event: Key): void {
        this.listeners.delete(event);
    }
}
