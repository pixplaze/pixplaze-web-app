# Pixplaze Web App

Веб-клиент Pixplaze: вход и регистрация, профиль, листинг серверов, заявки на подключение,
подтверждение OAuth 2.0 Device Flow. Работает поверх [pixplaze-web-api](../pixplaze-web-api).

## Стек

- **SvelteKit 2**, **Svelte 5**, **Vite 8**, `adapter-node`; SPA (`ssr = false`)
- PostCSS (nesting, custom media), Valibot, SVGO (спрайт иконок)

## Требования

- **Машина сборки:** Node.js 24, npm, Docker. Git нужен для версии сборки (см. ниже).
- **Удалённая машина:** Docker + Docker Compose.

## Конфигурация

| Переменная                    | Назначение                                                                    |
|-------------------------------|-------------------------------------------------------------------------------|
| `PUBLIC_PIXPLAZE_WEB_API_URL` | адрес API, по которому ходит **браузер** (не `localhost` на стенде), с CORS |

Читается в рантайме: локально — из `.env`, в контейнере — из `environment` в `docker-compose.yml`.
Образ от адреса API не зависит.

## Версия сборки

В боковой панели перед «выйти» — таблица версий APP и API: коммит, тег, время сборки.
Версия APP вшивается при сборке (`vite.config.js`): коммит и тег — из git, при отсутствии тега
на коммите — `version` из `package.json`. Версия API — `GET /info/version`.

Повышать версию: `npm version <x.y.z> --no-git-tag-version` — обновит `package.json` и `package-lock.json`
без коммита и тега.

## Локальный запуск

```shell
npm ci
npm run dev        # http://localhost:5173, доступен в LAN
```

SVG из `resources/icons` собираются в `static/icons/sprite.svg` при старте и при изменении иконок.

## Сборка образа

```shell
scripts/build-image.sh             # PLATFORM=linux/arm64 — для другой архитектуры
```

Собирает образ `pixplaze-web-app:<версия>` (версия — из `package.json`) и кладёт в `dist` всё для
переноса: архив образа, `version.env` (`PIXPLAZE_TAG=<версия>`) и копию `docker-compose.yml`.

Образ собирается из рабочей копии: незакоммиченные правки попадут в него. `.git` входит в контекст
сборки ради версии и в итоговый образ не попадает.

## Запуск на удалённой машине

```shell
scp dist/* user@remote:/opt/pixplaze/app/
```

Рядом на удалённой машине — `.env` стенда с `PUBLIC_PIXPLAZE_WEB_API_URL`, публичным адресом API
(не локальный `.env`: в нём адрес для разработки).

```shell
cd /opt/pixplaze/app
gunzip -c pixplaze-web-app-<версия>.tar.gz | docker load
docker compose --env-file .env --env-file version.env up -d
```

Без `version.env` compose возьмёт тег `latest`. Приложение слушает `3000`, compose публикует его
на `3000`.

## Эксплуатация

- Ошибка CORS — origin фронта не совпадает с `PIXPLAZE_WEB_APP_URL` в `.env` API.
- `ORIGIN` (adapter-node) — публичный адрес приложения, в compose закомментирован.
