const disabled = new Set();
const nativeFields = new Set();
export function immunitySlot(owner, field, index) {
    if (disabled.has(field)) return null;
    const array = owner[field];
    try {
        if (nativeFields.has(field)) return nativeSlot(owner, field, index);
        const value = array[index];
        return { read: () => array[index], write: v => { array[index] = v; }, value };
    } catch (error) {
        try {
            const slot = nativeSlot(owner, field, index);
            nativeFields.add(field);
            return slot;
        } catch (nativeError) {
            disabled.add(field);
            tl.log(`[Laser Pointer] Immunity access disabled for ${field}: ${nativeError}`);
            return null;
        }
    }
}

function nativeSlot(owner, field, index) {
    const array = owner[field];
    const value = array.get_Item(index);
    if (typeof array.set_Item !== 'function') throw new Error('Native setter unavailable');
    return { value, read: () => owner[field].get_Item(index), write: v => {
        const current = owner[field];
        current.set_Item(index, v);
        owner[field] = current;
    } };
}
