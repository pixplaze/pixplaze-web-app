export function mergeChanged(target, source) {
    let changed = false;

    for (const key of Object.keys(source)) {
        const value = source[key];
        const oldValue = target[key];

        if (value == null || Object.is(oldValue, value)) {
            continue;
        }

        if (isPlainObject(value) && isPlainObject(oldValue)) {
            if (mergeChanged(oldValue, value)) {
                changed = true;
            }

            continue;
        }
        console.log('changed:', key, 'from:', JSON.stringify(oldValue), 'to:', JSON.stringify(value));
        target[key] = value;
        changed = true;
    }

    return changed;
}

function isPlainObject(value) {
    if (value === null || typeof value !== 'object') {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
}
