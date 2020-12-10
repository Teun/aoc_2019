
export function intersection<T>(oneSet: Set<T>, otherSet: Set<T>) {
    // creating new set to store intersection
    const intersectionSet = new Set<T>();

    // Iterate over the values
    for (const elem of otherSet) {
        // if the other set contains a
        // similar value as of value[i]
        // then add it to intersectionSet
        if (oneSet.has(elem)) {
            intersectionSet.add(elem);
        }
    }

// return values of intersectionSet
    return intersectionSet;
}
