export const cleanInput = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined; // skip update
    }
    return value;
};
