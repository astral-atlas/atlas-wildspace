// @flow strict

export const createLockFunction = /*:: <I, O>*/(functionToLock/*: I => Promise<O>*/)/*: (I => Promise<O>)*/ => {
  let lock = null;
  const lockFunction = async (input) => {
    let release;
    if (lock) {
      const originalLock = lock;
      lock = new Promise(r => release = r);
      await originalLock;
    } else {
      lock = new Promise(r => release = r);
    }
    const output = await functionToLock(input);
    lock = null;
    release && release();
    return output;
  }
  return lockFunction;
};