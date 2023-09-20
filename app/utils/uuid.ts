import { v1 as uuidv1 } from "uuid";

function uuid() {
  const uniq = uuidv1();
  // 4 length random number between 0 and 1000
  const random = Math.floor(Math.random() * 1000);

  return `${uniq}-${random}`;
}

export default uuid;
