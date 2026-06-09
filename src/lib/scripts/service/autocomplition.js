export const getUsernameSuggestions = (value) => {
  const items = [
    'penis',
    'penal',
    'pencil',
    'ponos',
    'pashka',
    'pipidastr',
    'pinus',
    'opezdol',
    'bebra',
    'boloto',
    'borisoblebsk',
    'goyda',
    'govno'
  ];

  const filterSuggestions = (i) => {
    i = i.toLowerCase();
    value = value.toLowerCase();
    return value.length !== 0 && i !== value && i.startsWith(value);
  };

  return items.filter(filterSuggestions);
}

export const getEmailSuggestions = (value) => {
  if (!value) {
    return [];
  }

  const domains = [
    'gmail.com',
    'mail.ru',
    'mail.kz',
    'mail.com',
    'vk.com',
    'yandex.ru',
    'ya.ru',
    'yahoo.com',
    'tut.by',
    'tochka.by',
    'ukr.net',
    'i.ua',
    'meta.ua',
    'bk.ru',
    'inbox.ru',
    'rambler.ru',
    'hotmail.com',
    'live.com',
    'outlook.com',
    'icloud.com'
  ];

  // Разделяем введенное значение по первому символу '@'
  const atIndex = value.indexOf('@');

  let username = value;
  let domainPart = '';

  if (atIndex !== -1) {
    username = value.slice(0, atIndex);       // Всё, что ДО '@'
    domainPart = value.slice(atIndex + 1).toLowerCase();    // Всё, что ПОСЛЕ '@'
  }

  if (atIndex !== -1 && !domainPart) {
    return domains.map(domain => `${username}@${domain}`);
  }

  return domains.filter(domain => domain.startsWith(domainPart) && value !== `${username}@${domain}`)
      .map(domain => `${username}@${domain}`); // Собираем полный email обратно
}