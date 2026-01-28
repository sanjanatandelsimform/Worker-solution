/**
 * Selects evenly spaced items from an array. Used for rendering
 * certain number of x-axis labels.
 * @param dataArray - The array of items to select from.
 * @param count - The number of items to select.
 * @returns The selected items.
 */
export const selectEvenlySpacedItems = <T extends readonly unknown[]>(
  dataArray: T,
  count: number
): Array<T[number]> => {
  if (!dataArray || dataArray.length === 0) {
    return [];
  }
  const selectedItems: Array<T[number]> = [];
  if (dataArray.length === 1) {
    for (let i = 0; i < count; i++) {
      selectedItems.push(dataArray[0]);
    }
    return selectedItems;
  }
  for (let i = 0; i < count; i++) {
    const targetIndex = Math.round((i * (dataArray.length - 1)) / (count - 1));
    const boundedIndex = Math.max(0, Math.min(targetIndex, dataArray.length - 1));
    selectedItems.push(dataArray[boundedIndex]);
  }
  return selectedItems;
};
