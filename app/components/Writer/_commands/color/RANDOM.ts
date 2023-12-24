// generates a valid random color
export default function RANDOM_COLOR() {
  // random number between 0 and 255
  const random = () => Math.floor(Math.random() * 255);

  // return the random color
  return `rgb(${random()}, ${random()}, ${random()})`;

  return;
}

export function RANDOM_DEGREES() {
  return Math.floor(Math.random() * 360);
}

export function RANDOM_BACKGROUND(repeat: number = 0) {
  // array to repeat the background
  const repeatArray = Array.from({ length: repeat }).map(() => {
    return {
      top: RANDOM_COLOR(),
      bottom: RANDOM_COLOR(),
      deg: RANDOM_DEGREES(),
    };
  });

  // return the array
  return repeatArray;
}
