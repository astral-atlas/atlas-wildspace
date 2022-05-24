// @flow strict

export const randomIntRange = (max/*: number*/, min/*: number*/ = 0)/*: number*/ => {
  return Math.round(min + (Math.random() * (max - min)));
}

export const randomElement = /*:: <T>*/(array/*: $ReadOnlyArray<T>*/)/*: T*/ => {
  const i = randomIntRange(array.length);
  return array[i];
}


export const randomName = ()/*: string*/ => randomElement([
  "Veil of Shadows",
  "Vari the Able",
  "Vardette the Bardette",
  "Elara",
  "Mi Yooman",
  "Mórríghan Chalchiuhtlicue",
  "Amaya Saprai Karwasra"
]);
