// @flow strict
/*::
import type { Navigation } from "@lukekaalim/act-navigation";
import type { SetValue } from "@lukekaalim/act";
*/

export const usePageQuery = (queryKey/*: string*/, navigation/*: Navigation*/)/*: [?string, (value: ?string) => void]*/ => {
  const value = navigation.location.searchParams.get(queryKey);
  const setQueryValue = (nextValue) => {
    const url = new URL(navigation.location.href);
    if (!nextValue)
      url.searchParams.delete(queryKey)
    else
      url.searchParams.set(queryKey, nextValue);
      
    navigation.navigate(url)
  };

  return [value, setQueryValue]
}