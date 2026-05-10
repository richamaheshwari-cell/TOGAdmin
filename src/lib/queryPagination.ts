/**
 * Use as TanStack Query `placeholderData` for paginated admin lists.
 * Keeps the previous page visible while the next page loads so MUI DataGrid
 * `loading` does not flip to true and reset controlled server pagination
 * (fixes “first click does nothing, second click works”).
 */
export function keepPreviousListData<T>(previousData: T | undefined): T | undefined {
  return previousData;
}
