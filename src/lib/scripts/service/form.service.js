export function createFormData(data) {
  const formStructure = {};

  // Динамически перебираем все ключи исходного объекта
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      formStructure[key] = {
        value: data[key],
        isValid: false,
      };
    }
  }

  // Оборачиваем всю структуру в руну $state для глубокой реактивности
  return formStructure;
}

export function isFormDataValid(data) {
  for (const key in data) {
    if (!data[key] || !data[key].isValid) {
      return false;
    }
  }

  return true;
}
