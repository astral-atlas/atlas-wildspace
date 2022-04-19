// @flow strict
/*:: import type { Context, Updater } from '@lukekaalim/act'; */
import { createContext, useContext, useMemo } from '@lukekaalim/act';
import { navigationContext } from "@lukekaalim/act-navigation";


export const useURLParam = (paramName/*: string*/)/*: [string | null, (v: string | null) => mixed]*/ => {
  const nav = useContext(navigationContext);
  if (!nav)
    throw new Error();
  const { location, navigate } = nav;
  const paramValue = location.searchParams.get(paramName);

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