// @flow strict

// Velocity of +1 is key down
// Velocity of -1 is key up
// velocity of 0 is unchanged (down or up)
export const calculateKeyVelocity = (
  prevKeys/*: Set<string>*/,
  nextKeys/*: Set<string>*/,
)/*: Map<string, number>*/ => {
  const allKeys = new Set([...prevKeys, ...nextKeys]);
  const velocityPairs = [...allKeys]
    .map((key) => {
      const prev = prevKeys.has(key) ? 1 : 0;
      const next = nextKeys.has(key) ? 1 : 0;
      const velocity = next - prev;
      return [key, velocity];
    });
  return new Map(velocityPairs);
};