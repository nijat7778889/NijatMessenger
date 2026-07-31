#!/bin/bash
# Проставляет версию релиза везде, где она нужна, и пересчитывает размер файла.
#
# ЗАЧЕМ. Версия жила в шести местах четырёх файлов, и дважды разъезжалась:
# index.html и source.json показывали 1.9.17, а manifest.plist и README.md
# оставались на 1.9.12 — то есть страница обещала одно, а манифест установки
# сообщал другое. Из index.html число теперь подставляется из source.json на
# лету, а остальные три файла правит этот скрипт. В index.html он всё же
# заглядывает, но за другим: проставить версию в ссылках на стили и скрипт,
# чтобы браузер не смешал новую разметку со старым кэшем.
#
#   ./release.sh 1.9.19 "Что нового в этом релизе"
#
# Второй аргумент необязателен: без него описание в source.json не трогается.

set -euo pipefail

cd "$(dirname "$0")"

VERSION="${1:-}"
NOTES="${2:-}"

if [[ -z "$VERSION" ]]; then
  echo "Использование: ./release.sh <версия> [описание]" >&2
  echo "Например:      ./release.sh 1.9.19 \"Группировка сообщений и фон темы\"" >&2
  exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Версия должна быть вида 1.9.19, а не «$VERSION»" >&2
  exit 1
fi

IPA="app/NijatMessenger.ipa"
if [[ ! -f "$IPA" ]]; then
  echo "Нет файла $IPA — сначала соберите и положите сборку." >&2
  exit 1
fi

# Размер берём с диска, а не на слух: именно он уходит в source.json, и по
# нему AltStore решает, докачался файл или нет.
SIZE=$(stat -f%z "$IPA")
SIZE_MB=$(python3 -c "print(f'{$SIZE/1048576:.1f}')")
TODAY_ISO=$(date -u +%Y-%m-%dT00:00:00Z)
TODAY_RU=$(LC_ALL=ru_RU.UTF-8 date "+%-d %B %Y" 2>/dev/null || date "+%d.%m.%Y")

python3 - "$VERSION" "$SIZE" "$TODAY_ISO" "$NOTES" <<'PY'
import json, re, sys, pathlib

version, size, today, notes = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]

# --- source.json: источник истины для страницы -------------------------
p = pathlib.Path("source.json")
data = json.loads(p.read_text(encoding="utf-8"))
entry = data["apps"][0]["versions"][0]
entry["version"] = version
entry["size"] = size
entry["date"] = today
if notes:
    entry["localizedDescription"] = notes
p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# --- manifest.plist: bundle-version для установки по ссылке ------------
p = pathlib.Path("manifest.plist")
text = p.read_text(encoding="utf-8")
text = re.sub(r"(<key>bundle-version</key>\s*\n\s*<string>)[^<]*(</string>)",
              lambda m: m.group(1) + version + m.group(2), text)
p.write_text(text, encoding="utf-8")
print(f"manifest.plist  → {version}")
print(f"source.json     → {version}, {size} байт")
PY

# --- README.md: таблица «Информация о приложении» ----------------------
python3 - "$VERSION" "$SIZE_MB" "$TODAY_RU" <<'PY'
import re, sys, pathlib
version, size_mb, today = sys.argv[1], sys.argv[2], sys.argv[3]
p = pathlib.Path("README.md")
text = p.read_text(encoding="utf-8")
text = re.sub(r"(\| Версия\s*\|\s*)[^|]*(\|)", lambda m: m.group(1) + version + " " + m.group(2), text)
text = re.sub(r"(\| Размер\s*\|\s*)[^|]*(\|)", lambda m: m.group(1) + size_mb + " МБ " + m.group(2), text)
text = re.sub(r"(\| Обновлено\s*\|\s*)[^|]*(\|)", lambda m: m.group(1) + today + " " + m.group(2), text)
p.write_text(text, encoding="utf-8")
print(f"README.md       → {version}, {size_mb} МБ, {today}")
PY

# --- index.html: версия в ссылках на стили и скрипт --------------------
# Обновление ломало страницу тем, кто уже заходил: разметка приходила новая, а
# styles.css и script.js браузер брал из кэша старые. Старый скрипт искал в
# новой разметке кнопку, которой там уже нет, падал — и вся страница ниже
# первого экрана оставалась пустой. Версия в ссылке делает файлы разными
# адресами, и подмена становится невозможной.
#
# Заодно правим запасные значения версии и размера прямо в разметке. Обычно их
# подставляет скрипт из source.json, и в разметке они нужны лишь на случай, когда
# скрипт не отработал (или его отключили). Но именно поэтому они и устаревают
# незаметно: страница молча показывает прошлый выпуск, и заметить это можно
# только с выключенным JS. Раз уж версия правится здесь — правим и их.
python3 - "$VERSION" "$SIZE_MB" <<'PY'
import re, sys, pathlib
version, size_mb = sys.argv[1], sys.argv[2]
p = pathlib.Path("index.html")
text = p.read_text(encoding="utf-8")
before = text
text, n_css = re.subn(r'(href="styles\.css)(?:\?v=[^"]*)?(")',
                      lambda m: m.group(1) + "?v=" + version + m.group(2), text)
text, n_js = re.subn(r'(src="script\.js)(?:\?v=[^"]*)?(")',
                     lambda m: m.group(1) + "?v=" + version + m.group(2), text)
# Считаем СОВПАДЕНИЯ, а не факт изменения текста. Повторный запуск с той же
# версией — законная операция (например, пересобрали сборку и хотите обновить
# только размер), и «ничего не поменялось» здесь означает «всё уже на месте»,
# а не «ссылок нет».
if n_css == 0 or n_js == 0:
    raise SystemExit("index.html: не нашёл ссылок на styles.css / script.js")
# Запасные значения: <b data-version>1.9.20</b>, <span data-size>4.1 МБ</span>
text = re.sub(r'(data-version>)[^<]*(<)', lambda m: m.group(1) + version + m.group(2), text)
text = re.sub(r'(data-size>)[^<]*(<)', lambda m: m.group(1) + size_mb + " МБ" + m.group(2), text)
p.write_text(text, encoding="utf-8")
print(f"index.html      → ?v={version}, запасные значения {version} / {size_mb} МБ")
PY

echo
echo "Готово. Проверьте: git diff"
