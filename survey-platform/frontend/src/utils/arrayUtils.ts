export const areArraysEqual = (
  arr1: Array<Record<string, any>>,
  arr2: Array<Record<string, any>>
): boolean => {
  if (arr1.length !== arr2.length) return false;

  return arr1.every((item, index) => {
    const other = arr2[index];

    const keys1 = Object.keys(item);
    const keys2 = Object.keys(other);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      const val1 = item[key];
      const val2 = other[key];

      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) return false;
        if (!val1.every((opt, i) => opt === val2[i])) return false;
      } else {
        if (val1 !== val2) return false;
      }
    }

    return true;
  });
};