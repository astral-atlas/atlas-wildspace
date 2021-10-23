// @flow strict
/*:: import type { Context, Updater } from '@lukekaalim/act'; */
import { createContext, useContext, useMemo } from '@lukekaalim/act';

/*::
export type Navigation = {
  url: URL,
  navigate: (url: URL) => void,
};
*/

export const navigationContext/*: Context<?Navigation>*/ = createContext(null);

export const useNavigation = ()/*: Navigation*/ => {
  const navigation = useContext(navigationContext);
  if (!navigation)
    throw new Error();
  return navigation;
};

export const useURLParam = (paramName/*: string*/)/*: [string | null, (v: string | null) => mixed]*/ => {
  const { url, navigate } = useNavigation();
  const paramValue = url.searchParams.get(paramName);

  const setParamValue = (id) => {
    const url = new URL(document.location.href);

    const nextUrl = new URL(url.href);
    if (id !== null)
      nextUrl.searchParams.set(paramName, id);
    else
      nextUrl.searchParams.delete(paramName);
    navigate(nextUrl);
  }

  return [paramValue, setParamValue];
}