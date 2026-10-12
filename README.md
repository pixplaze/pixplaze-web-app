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
docker build --platform linux/amd64 -t pixplaze-web-app:latest --load .
docker save pixplaze-web-app:latest | gzip > pixplaze-web-app.tar.gz
```

Образ собирается из рабочей копии: незакоммиченные правки попадут в него. `.git` входит в контекст
сборки ради версии и в итоговый образ не попадает.

## Запуск на удалённой машине

```shell
scp pixplaze-web-app.tar.gz docker-compose.yml user@remote:/opt/pixplaze/app/
```

В `docker-compose.yml` задать `PUBLIC_PIXPLAZE_WEB_API_URL` — публичный адрес API.

```shell
cd /opt/pixplaze/app
gunzip -c pixplaze-web-app.tar.gz | docker load
docker compose up -d --no-build    # иначе compose соберёт образ по build: .
```

Приложение слушает `3000`, compose публикует его на `80`.

## Эксплуатация

- Ошибка CORS — origin фронта не совпадает с `PIXPLAZE_WEB_APP_URL` в `.env` API.
- `ORIGIN` (adapter-node) — публичный адрес приложения, в compose закомментирован.
