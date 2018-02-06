export interface Constructable {
    new();
}

export interface TypedConstructable<T> {
    new(): T;
}
