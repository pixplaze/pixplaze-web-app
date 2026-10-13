const DOMAINS = [
  'gmail.com', 'mail.ru', 'mail.kz', 'mail.com', 'vk.com', 'yandex.ru', 'ya.ru', 'yahoo.com',
  'tut.by', 'tochka.by', 'ukr.net', 'i.ua', 'meta.ua', 'bk.ru', 'inbox.ru', 'rambler.ru',
  'hotmail.com', 'live.com', 'outlook.com', 'icloud.com'
];

/** Подсказки email: введённое имя + популярные домены, отфильтрованные по части после '@'. */
export const getEmailSuggestions = (value) => {
  if (!value) {
    return [];
  }

  const atIndex = value.indexOf('@');
  const username = atIndex === -1 ? value : value.slice(0, atIndex);
  const domainPart = atIndex === -1 ? '' : value.slice(atIndex + 1).toLowerCase();

  if (atIndex !== -1 && !domainPart) {
    return DOMAINS.map(domain => `${username}@${domain}`);
  }

  return DOMAINS.filter(domain => domain.startsWith(domainPart) && value !== `${username}@${domain}`)
      .map(domain => `${username}@${domain}`);
}
