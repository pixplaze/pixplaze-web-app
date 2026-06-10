export function createFormData(data) {
  const formStructure = {};

  // Динамически перебираем все ключи исходного объекта
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      continue;
    }

    if (
        Object.prototype.hasOwnProperty.call(data[key], 'isValid') ||
        Object.prototype.hasOwnProperty.call(data[key], 'value')
    ) {
      formStructure[key] = data[key];
      continue;
    }

    formStructure[key] = {
      value: data[key],
      isValid: false,
    };
  }

  return formStructure;
}

export function isPropertyValid(property) {
  return property.isValid && !!property.value && !!property.value.trim();
}

export function isFormDataValid(data) {
  console.log('isFormDataValid(obj)');
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      continue;
    }
    console.log(`${key}: '${data[key].value}', isValid: ${isPropertyValid(data[key])}`);
    if (!isPropertyValid(data[key])) {
      return false;
    }
  }

  return true;
}
