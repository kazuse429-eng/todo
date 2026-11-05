// オフライン用: 初回に全ファイルを保存し、以後は保存分を表示する。
// 版(VERSION)は build.py が中身のハッシュで埋める。新しい版を公開すると、次に開いたとき裏で入れ替わる。
const VERSION = "034868dd9ac7";
const CACHE = "todo-" + VERSION;
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("todo-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  // GitHub の API（同期）は素通し。自分のファイルだけ保存分を出す
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request)));
});
