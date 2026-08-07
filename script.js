/* ==========================================================================
   NijatMessenger — поведение страницы

   Что здесь есть и чего намеренно нет.
   ЕСТЬ: два языка, две темы, появление блоков при прокрутке, выбор способа
   установки, отложенная загрузка видео и подстановка версии из source.json.
   НЕТ: свечения под курсором, наклона карточек и «магнитных» кнопок, которые
   были раньше. Страницу открывают с iPhone — там нет курсора, и весь этот код
   исполнялся впустую, отнимая время на разбор и подписку на события.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------ */
  /* Словарь                                                             */
  /* ------------------------------------------------------------------ */
  /* Русский лежит в самой разметке — так страница читается и без скрипта, и
     поисковиком. Здесь только английский плюс несколько ключей, которые
     нужны обоим языкам (заголовок вкладки, описание). */
  var EN = {
    donateTag: "Support",
    donateTitle: "VIP and admin rights",
    donateSub: "The app is free and will stay free. A donation unlocks optional extras and helps keep the server running: VIP gives up to three names on one account plus profile styling, admin rights add moderation of the public room.",
    donateVip: "VIP",
    donateVipText: "Up to three names on one account, nick colour, avatar ring and a crown.",
    p30: "30 days",
    p90: "90 days",
    p365: "365 days",
    donateAdmin: "Administrator",
    donateAdminText: "Everything in VIP, plus moderation of the public room: mute, kick and ban.",
    donate1t: "Send a donation",
    donate1p: "Send the amount from the table above. In the comment, state your nickname in the app, whether you want VIP or admin, and for how many days. Without a nickname there is nobody to issue the key to.",
    donate2t: "Wait for the key",
    donate2p: "The key comes back the same way the donation arrived, usually within a day. Issuing is still manual: there is no automatic checkout on this site.",
    donate3t: "Enter it in the app",
    donate3p: "Settings, then Store, then \"I have a key\". The key is issued for your nickname and will not work on another one.",
    donateBtn: "Send a donation",
    donateNote: "Payment goes through DonationAlerts. This is not an App Store purchase: Apple refunds do not apply, and any questions are settled directly with me.",
    skip: "Skip to content",
    themeLabel: "Theme",
    eyebrow: "Direct link · no server",
    heroTitle: "Messages that never leave your phones",
    heroLead: "Messages go straight from one phone to another and are encrypted on the devices themselves. Nearby they travel over Wi-Fi and Bluetooth — no internet at all. No account, no phone number.",
    download: "Download .ipa",
    howTo: "How to install",
    version: "version",
    noticeSign: "The app is signed with your own Apple ID, on your phone. With a free Apple ID that signature lasts 7 days — renewing it takes one tap.",

    schemaAlt: "Two phones linked directly, with no server in between",
    schemaYou: "Your phone",
    schemaPeer: "The other person",
    schemaVia: "Wi-Fi · Bluetooth",
    schemaNoServer: "No server",

    installTag: "4 steps",
    installTitle: "How to install",
    installSub: "Two ways. Both install the same app and are equally safe — the signing happens with your own Apple ID, on your own device.",
    noPC: "no computer",
    withPC: "needs a computer",
    il1t: "Install iLoader on a computer",
    il1p: "It is a desktop program — follow the guide on the <a href=\"https://iloader.site/\" target=\"_blank\" rel=\"noopener noreferrer\">iLoader site</a>. You will connect the phone by cable.",
    il2t: "Download the file to that computer",
    il2p: "Tap “Download .ipa” on this page in the computer's browser, not the phone's: the file has to sit where iLoader is.",
    il3t: "Connect the iPhone by cable",
    il3p: "Sign in to your Apple ID inside iLoader and wait for the phone to appear in the device list. Then Import IPA — and pick the file you downloaded.",
    il4t: "Trust the developer",
    il4p: "Once only, now on the phone: Settings → General → VPN &amp; Device Management → pick the profile → Trust.",
    as1t: "Install AltStore on the iPhone",
    as1p: "Follow the guide at <a href=\"https://altstore.io\" target=\"_blank\" rel=\"noopener noreferrer\">altstore.io</a>, straight from the phone. No computer needed for this route.",
    as2t: "Download the file",
    as2p: "Open this page in Safari on your iPhone and tap “Download .ipa”. It lands in Files → Downloads.",
    as3t: "Open it through AltStore",
    as3p: "Tap the file → Share → Copy to AltStore. Or inside AltStore: My Apps → “+”.",
    as4t: "Trust the developer",
    as4p: "Settings → General → VPN &amp; Device Management → profile → Trust. After that AltStore can renew the signature on its own.",

    lookTitle: "What it looks like",
    shotChat: "The shared room: messages from one person are grouped, without repeating the name",
    shotEmpty: "45 themes, light and dark",

    aboutTitle: "What makes it different",
    f1tag: "Link",
    f2tag: "Encryption",
    f3tag: "Name",
    f1t: "Works without the internet",
    f1p: "With people nearby the phone connects directly — over Wi-Fi and Bluetooth. On a plane, in a basement, with mobile data off, the conversation carries on.",
    f2t: "Encrypted on the device",
    f2p: "Keys never leave the phone. The relay only sees who to forward a packet to, never what is inside it.",
    f3t: "No account, no phone number",
    f3p: "Signing up means picking a name. No phone, no email, no password. A name belongs to a device, and nobody can take one that's already taken.",

    videoTitle: "Installation video",
    playVideo: "Watch on YouTube",

    faqTitle: "Common questions",
    q1: "The file previews instead of downloading",
    a1: "Press and hold “Download .ipa” and choose “Download Linked File” — Safari will save it into Files.",
    q2: "It downloaded, but there's no icon on the Home Screen",
    a2: "That's expected: an .ipa installs nothing by itself. It has to be signed through iLoader or AltStore — then the icon appears.",
    q3: "It asks me to sign in to Apple ID",
    a3: "That's normal and both ways require it: this is how the app gets signed for you personally, on install and on every renewal.",
    q4: "It says “Untrusted Developer”",
    a4: "Settings → General → VPN &amp; Device Management → pick the profile → Trust.",
    q5: "The app stopped opening after a week",
    a5: "That's the free Apple ID limit: a signature lasts 7 days. In AltStore tap Refresh, in iLoader reinstall with the same file. Your data stays put.",
    q6: "Can I use both ways at once?",
    a6: "No, pick one. It's the same app with the same identifier: installing the second way simply replaces the first.",

    closingTitle: "Ready to try it?",
    closingSub: "Version <span data-version></span>, <span data-size></span>, iOS 16 and newer.",
    footerNote: "Messages and calls are encrypted on the device. No ads, no data collected about you.",

    docTitle: "NijatMessenger — a messenger with no servers and no accounts",
    docDesc: "A messenger for iPhone: messages go straight between devices and are encrypted on them. Works even without the internet — nearby over Wi-Fi and Bluetooth. Download the .ipa and install it with iLoader."
  };

  /* Русские значения снимаем с разметки при первом запуске: держать их ещё и
     здесь значило бы иметь два источника правды и однажды их рассинхронить. */
  var RU = null;
  var currentLang = "ru";
  function captureRussian() {
    RU = { docTitle: document.title, docDesc: metaContent("description") };
    $$("[data-i18n]").forEach(function (el) { RU[el.dataset.i18n] = el.innerHTML; });
    $$("[data-i18n-aria]").forEach(function (el) { RU[el.dataset.i18nAria] = el.getAttribute("aria-label"); });
  }
  function metaContent(name) {
    var m = $('meta[name="' + name + '"]');
    return m ? m.getAttribute("content") : "";
  }
  function setMeta(name, value) {
    var m = $('meta[name="' + name + '"]'); if (m) m.setAttribute("content", value);
  }

  function applyLang(lang) {
    if (!RU) captureRussian();
    var dict = lang === "en" ? EN : RU;

    $$("[data-i18n]").forEach(function (el) {
      var v = dict[el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });
    $$("[data-i18n-aria]").forEach(function (el) {
      var v = dict[el.dataset.i18nAria];
      if (v != null) el.setAttribute("aria-label", v);
    });

    document.title = dict.docTitle || document.title;
    setMeta("description", dict.docDesc || metaContent("description"));
    var ogT = $('meta[property="og:title"]'), ogD = $('meta[property="og:description"]');
    if (ogT && dict.docTitle) ogT.setAttribute("content", dict.docTitle);
    if (ogD && dict.docDesc) ogD.setAttribute("content", dict.docDesc);

    root.lang = lang;
    currentLang = lang;
    try { localStorage.setItem("nm-lang", lang); } catch (e) {}
    $$("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    // Версия и размер живут в отдельных узлах, а перевод переписал innerHTML
    // родителей — поэтому подставляем их заново.
    fillVersion();
  }

  /* ------------------------------------------------------------------ */
  /* Версия и размер — из source.json                                    */
  /* ------------------------------------------------------------------ */
  /* Одно место вместо шести. Раньше число было вписано руками в index.html
     (трижды), source.json, manifest.plist и README, и дважды разъезжалось:
     сайт показывал одну версию, манифест — другую. */
  var release = null;

  /* Единица измерения живёт здесь, а не в разметке: английский словарь
     подставляет в предложение голый <span data-size>, без «МБ». Значит,
     подписать число может только тот, кто его и ставит. */
  function fillVersion() {
    if (!release) return;
    var unit = currentLang === "en" ? " MB" : " МБ";
    $$("[data-version]").forEach(function (n) { n.textContent = release.version; });
    $$("[data-size]").forEach(function (n) { n.textContent = release.mb + unit; });
  }
  function loadRelease() {
    if (!window.fetch) return;
    fetch("source.json", { cache: "no-cache" }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (data) {
      if (!data) return;
      var v = data.apps && data.apps[0] && data.apps[0].versions && data.apps[0].versions[0];
      if (!v) return;
      release = { version: v.version, mb: (v.size / 1048576).toFixed(1) };
      fillVersion();
    }).catch(function () { /* останется то, что в разметке */ });
  }

  /* ------------------------------------------------------------------ */
  /* Тема                                                                */
  /* ------------------------------------------------------------------ */
  function applyTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem("nm-theme", theme); } catch (e) {}
    var meta = $('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0E1512" : "#F4F6F5");
  }

  /* ------------------------------------------------------------------ */
  /* Появление при прокрутке                                             */
  /* ------------------------------------------------------------------ */
  /* Скрытое до прокрутки содержимое — единственное место, где ошибка в скрипте
     стоит человеку всей страницы, поэтому здесь подстраховка.

     Так уже было: после обновления сайта вернувшимся посетителям доставался из
     кэша старый скрипт, он искал в новой разметке кнопку, которой там больше
     нет, падал на ней — и все 22 блока с .reveal навсегда оставались на
     opacity: 0. Ниже первого экрана страница была пустой: ни установки, ни
     вопросов, ни кнопки скачивания.

     Правило простое: оформление имеет право не сработать, содержимое обязано
     остаться видимым. */
  var revealReady = false;
  function showEverything() {
    $$(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }
  setTimeout(function () { if (!revealReady) showEverything(); }, 2000);

  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) { revealReady = true; return; }
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduced) {
      showEverything();
      revealReady = true;
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
    revealReady = true;
  }

  /* ------------------------------------------------------------------ */
  /* Способ установки                                                    */
  /* ------------------------------------------------------------------ */
  function initInstallTabs() {
    var tabs = [
      { btn: $("#tabILoader"),  panel: $("#panelILoader") },
      { btn: $("#tabAltStore"), panel: $("#panelAltStore") }
    ];
    if (!tabs[0].btn || !tabs[1].btn) return;
    tabs.forEach(function (t) {
      t.btn.addEventListener("click", function () {
        tabs.forEach(function (o) {
          var on = o === t;
          o.btn.setAttribute("aria-selected", String(on));
          o.panel.hidden = !on;
          // Панель могла появиться уже после прохода наблюдателя.
          if (on) o.panel.classList.add("is-visible");
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Видео по нажатию                                                    */
  /* ------------------------------------------------------------------ */
  /* Iframe на загрузке тянул скрипты YouTube каждому, кто просто открыл
     страницу. На мобильном интернете это заметно, а видео смотрят единицы. */
  function initVideo() {
    var box = $("#videoBox"), play = $("#videoPlay");
    if (!box || !play) return;
    play.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = box.dataset.embed;
      f.title = "NijatMessenger";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.referrerPolicy = "strict-origin-when-cross-origin";
      f.allowFullscreen = true;
      box.innerHTML = "";
      box.appendChild(f);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Запуск                                                              */
  /* ------------------------------------------------------------------ */
  function init() {
    captureRussian();

    var lang = root.lang === "en" ? "en" : "ru";
    if (lang === "en") applyLang("en");
    $$("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
      b.addEventListener("click", function () { applyLang(b.dataset.lang); });
    });

    var themeBtn = $("#themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
      });
    }

    var year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    initReveal();
    initInstallTabs();
    initVideo();
    loadRelease();
  }

  /* init целиком под присмотром: одна опечатка в любом из обработчиков не
     должна уносить с собой всю страницу. Если упали — показываем содержимое
     и оставляем след в консоли. */
  function start() {
    try {
      init();
    } catch (e) {
      showEverything();
      if (window.console && console.error) console.error("NijatMessenger:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
