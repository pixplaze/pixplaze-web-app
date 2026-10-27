export const required = name => {
  throw new Error(`Property '${name}' is required!`);
}
