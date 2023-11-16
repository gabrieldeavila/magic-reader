import { v1 as uuidv1 } from "uuid";

function uuid(): string {
  const uniq = uuidv1();
  // 4 length random number between 0 and 10000
  const random = Math.floor(Math.random() * 10000);

  return `${uniq}-${random}`;
}

export default uuid;
