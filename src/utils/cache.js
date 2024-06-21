
function removeElementFromSet(set, elementToRemove) {
    if (set.has(elementToRemove)) {
        set.delete(elementToRemove);
    }
    return set;
}

module.exports = { removeElementFromSet }
