/* =========================================================================
   Dexichs — поведение страницы

   Здесь ровно три вещи: переключение языка, появление разделов при
   прокрутке и полоска под шапкой, когда страница сдвинута. Больше сайту
   ничего не нужно — он про то, что умеет приложение, а не про себя.
   ========================================================================= */

(function () {
  "use strict";

  /* ---- Язык ------------------------------------------------------------
     Русский — основной, английский — полный перевод той же страницы.
     Ключи совпадают с data-i18n в разметке; чего нет в словаре, остаётся
     по-русски, а не пропадает. */

  var EN = {
    navHow: "How it works", navInside: "What is inside",
    navPrivacy: "Privacy", navSupport: "Support",

    heroEyebrow: "P2P · no server in between",
    // Те же строки-маски, что и в русском варианте: иначе при переключении
    // языка заголовок терял бы свою раскладку и въезд по строкам.
    heroTitle: "<span class=\"line\"><span>Connects</span></span><span class=\"line\"><span>two phones</span></span><span class=\"line\"><span><em>directly</em></span></span>",
    heroLede: "When the other person is nearby, no internet is needed at all: the app finds them over Wi-Fi or Bluetooth and connects on its own. When they are far away, the message gets there through a relay, encrypted.",
    chip1: "No phone number", chip2: "Encrypted on your device", chip3: "iPhone · iOS 16+",

    howEyebrow: "How it works",
    howTitle: "Two roads to the other person",
    howLede: "One works where there is no network at all. The other is for when the person is far away. You can switch right inside the public room, without going into settings.",
    p1t: "Nearby — no internet",
    p1d: "Wi-Fi and Bluetooth straight between phones. On a plane, in the underground, in the mountains, at a camp, with the network down. The server takes no part in this at all.",
    p2t: "Far away — through a relay",
    p2d: "It carries encrypted bytes and cannot read them. If you are offline, the message waits in a mailbox and arrives when you come back.",
    p3t: "A name instead of a number",
    p3d: "Signing up means picking one name. It is bound to your device key: nobody else can take it, and you get it back after reinstalling.",

    insideEyebrow: "What is inside",
    insideTitle: "Everything the app can do",
    insideLede: "For reference: everything listed below works today.",

    f1t: "Messaging",
    f1a: "Text, photos, stickers, voice notes",
    f1b: "Replies and editing what you sent",
    f1c: "Search through a conversation, and forwarding",
    f1d: "Groups and a public room",
    f2t: "Calls",
    f2a: "Voice and video, one to one or as a group",
    f2b: "Screen sharing",
    f2c: "They arrive like an ordinary phone call",
    f3t: "Watching together",
    f3a: "YouTube, TikTok, VK Video or a direct link",
    f3b: "The host drives, everyone else follows",
    f3c: "Its own chat and voice inside the room",
    f4t: "Games for a group",
    f4a: "Durak, Mafia, Spy, Words",
    f4b: "Shared chat and voice during the game",
    f4c: "Statistics survive a reinstall",
    f4d: "They work without the internet too, if everyone is nearby",
    f5t: "Profile",
    f5a: "Display name, bio, emoji status",
    f5b: "Avatar, banner, name colour",
    f5c: "Dark and light themes",
    f5d: "Moving your account to another phone",
    f6t: "Notifications",
    f6a: "With sound, silent, or off completely",
    f6b: "Name and text show on a closed phone",
    f6c: "Decrypted on your device, not on the way",
    f7t: "Keeping it civil",
    f7a: "Report a person or a message",
    f7b: "Block someone just for yourself",
    f7c: "Bans follow the device key, not the name",
    f8t: "Three languages",
    f8d: "The interface is fully translated into Russian, English and Azerbaijani. People's names, room titles and the messages themselves stay as they were written.",

    lookEyebrow: "Looks", lookTitle: "A face of its own —<br>and one for you",
    tintEyebrow: "Icon colour",
    tintLede: "The home screen icon can be repainted — eight options, applied at once.",

    privEyebrow: "Privacy", privTitle: "What is known about you, and to whom",
    pr1t: "Messages",
    pr1d: "<strong>Encrypted on your device</strong> with the recipient's key and decrypted only on theirs. The relay sees a blob of bytes and a recipient name — enough to forward, not enough to read.",
    pr2t: "Never asked for",
    pr2d: "Phone number, email address, real name, address book, location. No advertising, no analytics, and no third-party libraries in the app at all.",
    pr3t: "Notifications",
    pr3d: "The push from Apple carries <strong>only an encrypted piece of the message</strong>. No name and no text — the server does not know them either. The real name appears on screen on your own device, with your own key.",
    pr4t: "One exception",
    pr4d: "Reports. When you report a message, <strong>you</strong> attach an excerpt yourself, and it is stored in plain text: otherwise there would be nothing to review.",
    pr5t: "Deletion",
    pr5d: "You delete your account inside the app: <em>Profile → Account → Delete account</em>. Your name, profile, character and statistics are erased.",
    privLink: "Full privacy policy →",

    faqEyebrow: "Questions", faqTitle: "The short answers",
    q1: "Does it really work without the internet?",
    a1: "Yes, if the other person is nearby — roughly within a room or a floor. The phones find each other over Wi-Fi and Bluetooth and connect directly. The internet is only needed to reach someone far away.",
    q2: "Who can read my messages?",
    a2: "Only the person you write to. Messages are encrypted on your device with the recipient's key. We hold no key and have no way to obtain one.",
    q3: "I reinstalled the app — will I lose my name?",
    a3: "No. The name is bound to your device key, and the key lives in the keychain and survives a reinstall. Your profile and game statistics come back with it.",
    q4: "Where do I download it?",
    a4: "The app is being prepared for the App Store. This site is informational: it describes what the app does. The link will appear here as soon as it is out.",
    q5: "What does it cost?",
    a5: "Messaging, calls, games and watching together are free. There is no paid access to talking to people, and none is planned.",
    q6: "What about Android?",
    a6: "iPhone only for now, iOS 16 and newer. Nearby connection is built on Apple's technology, and an Android version would need a different one.",

    fPrivacy: "Privacy policy", fSupport: "Support",
    fNote: "This site is informational. The app is not distributed from here — wait for the App Store release."
  };

  var original = null;

  function collect() {
    // Русский снимаем прямо из разметки: держать его ещё и в словаре значит
    // держать два источника правды, которые однажды разойдутся.
    original = {};
    document.querySelectorAll("[data-i18n], [data-i18n-html]").forEach(function (node) {
      var key = node.getAttribute("data-i18n") || node.getAttribute("data-i18n-html");
      original[key] = node.innerHTML;
    });
  }

  function apply(lang) {
    if (!original) collect();
    document.querySelectorAll("[data-i18n], [data-i18n-html]").forEach(function (node) {
      var key = node.getAttribute("data-i18n") || node.getAttribute("data-i18n-html");
      var value = lang === "en" ? EN[key] : original[key];
      if (value != null) node.innerHTML = value;
    });
    document.documentElement.lang = lang;
    document.querySelectorAll(".lang button").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
    try { localStorage.setItem("dexichs-lang", lang); } catch (e) { /* приватный режим */ }
  }

  var saved = null;
  try { saved = localStorage.getItem("dexichs-lang"); } catch (e) { /* см. выше */ }
  var start = saved || ((navigator.language || "ru").toLowerCase().indexOf("ru") === 0 ? "ru" : "en");
  if (start === "en") apply("en"); else collect();

  document.querySelectorAll(".lang button").forEach(function (button) {
    button.addEventListener("click", function () { apply(button.dataset.lang); });
  });

  /* ---- Появление при прокрутке ---------------------------------------- */

  var reveals = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    reveals.forEach(function (node) { node.classList.add("is-in"); });
  } else {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        seen.unobserve(entry.target);   // показали — и хватит, обратно не прячем
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    reveals.forEach(function (node) { seen.observe(node); });
  }

  /* ---- Появление по очереди -------------------------------------------
     Соседи в одной сетке не должны выпрыгивать разом: задержка растёт по
     порядку, но упирается в потолок — иначе последняя карточка в длинном
     ряду появлялась бы заметно позже остальных, и это читалось бы как
     подвисание, а не как замысел. */

  ["\u002Epillars", "\u002Efeatures", "\u002Etints", "\u002Efacts", "\u002Eqa"].forEach(function (selector) {
    var group = document.querySelector(selector);
    if (!group) return;
    Array.prototype.forEach.call(group.children, function (child, index) {
      child.style.setProperty("--d", Math.min(index * 0.07, 0.35) + "s");
    });
  });

  /* ---- Плавное раскрытие вопроса ---------------------------------------
     У <details> своей анимации нет: он открывается рывком. Оборачиваем ответ
     в слой с высотой и ведём её руками, а сам details закрываем только после
     того, как высота доехала до нуля — иначе ответ исчезал бы мгновенно. */

  var slow = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".qa details").forEach(function (item) {
    var summary = item.querySelector("summary");
    var body = document.createElement("div");
    body.className = "answer";
    while (summary.nextSibling) body.appendChild(summary.nextSibling);
    item.appendChild(body);

    function height() { return body.firstElementChild ? body.scrollHeight : 0; }

    summary.addEventListener("click", function (event) {
      if (slow) return;
      event.preventDefault();
      if (item.open) {
        body.style.height = height() + "px";
        requestAnimationFrame(function () { body.style.height = "0px"; });
        body.addEventListener("transitionend", function done() {
          body.removeEventListener("transitionend", done);
          item.open = false;
        });
      } else {
        item.open = true;
        body.style.height = "0px";
        requestAnimationFrame(function () { body.style.height = height() + "px"; });
        body.addEventListener("transitionend", function done() {
          body.removeEventListener("transitionend", done);
          body.style.height = "auto";   // чтобы переворот экрана не обрезал текст
        });
      }
    });
  });

  /* ---- Шапка: полоска-разделитель и полоска прочитанного --------------- */

  var top = document.querySelector(".top");
  var progress = document.querySelector(".progress");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      top.classList.toggle("is-stuck", y > 8);
      if (progress) {
        var full = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty("--p", full > 0 ? Math.min(y / full, 1) : 0);
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
})();
