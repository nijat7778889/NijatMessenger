/* NijatMessenger — оболочка приложения для работы без сети.
 *
 * ЗАЧЕМ. Приложение ставится значком на домашний экран, а открывают его как
 * обычную программу — в том числе в метро, в самолёте и в лифте. Без этого
 * файла значок в таких местах давал пустую белую страницу: браузеру нечего
 * показать, пока он не сходит на сервер.
 *
 * Кэшируем ровно оболочку — разметку, сборку и шрифты значков. Переписка тут ни
 * при чём: она лежит в памяти самого телефона и никуда не девается.
 *
 * СТРАТЕГИЯ РАЗНАЯ ДЛЯ РАЗНОГО, и это не усложнение ради усложнения:
 *
 *   сборка и шрифты — сначала кэш. Их имена содержат отпечаток содержимого,
 *     поэтому новая версия это всегда новое имя, и отдать старое из кэша
 *     безопасно: подмениться нечему;
 *
 *   разметка — сначала сеть. Это единственный файл с постоянным именем, и
 *     именно в нём меняется ссылка на новую сборку. Отдавай мы его из кэша,
 *     человек навсегда остался бы на той версии, которую открыл однажды.
 */

const CACHE = 'nijat-shell-v1';
const SHELL = './';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([SHELL])).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Чужие адреса не трогаем вовсе: ретранслятор ходит по WebSocket, а его
  // кэшировать нельзя ни в каком виде.
  if (url.origin !== self.location.origin) return;

  const isDocument = request.mode === 'navigate';

  if (isDocument) {
    // Сначала сеть: в разметке лежит ссылка на текущую сборку.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(SHELL, copy));
          return response;
        })
        .catch(() => caches.match(SHELL).then((hit) => hit || Response.error())),
    );
    return;
  }

  // Всё остальное — сначала кэш. Промах докладываем в кэш, чтобы во второй раз
  // он уже был.
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
