// get random alias from 1 to 20
const randomAlias = () => {
  const random = Math.floor(Math.random() * 20) + 1;

  return `SCRIBERE.RANDOM_ALIAS.${random}`;
};

export default randomAlias;
