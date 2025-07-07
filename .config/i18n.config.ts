export default defineI18nConfig(() => ({
  legacy: false,
  strategy: 'no_prefix',
  fallbackWarn: false,
  missingWarn: false,
  messages: {
    et: {
      "welcome": "Tere tulemast",
      "login": "Logi sisse",
      "logout": "Logi välja",
      "loggedIn": "Sisse logitud",
      "language": "Keel",
      "appName": "ESMuseum Kaardid",
      "title": "ESMuseum Kaardid",
      "description": "Eesti muuseumide kaartide rakendus",
      "loading": "Laadimine...",
      "error": "Viga",
      "noMaps": "Kaarte ei leitud",
      "untitled": "Nimetu",
      "viewMap": "Vaata kaarti",
      "redirecting": "Suunamine...",
      "navigation": {
        "title": "Navigatsioon",
        "maps": "Kaardid",
        "requiresLogin": "Nõuab sisselogimist",
        "kmlPlugin": "KML Plugin",
        "entuConsole": "Entu konsool"
      },
      "browserConsole": {
        "title": "Brauseri konsool",
        "description": "Ava oma brauseri arenduskonsool (F12) Entu API-ga suhtlemiseks.",
        "quickStart": "Kiire alustamine:",
        "step1": "Samm 1: Hangi kõik kaardid",
        "step2": "Samm 2: Loo uus kirje"
      },
      "authentication": {
        "title": "Autentimine",
        "description": "See konool on mõeldud arendajatele, kes soovivad testida Entu API funktsionaalsust."
      }
    },
    en: {
      "welcome": "Welcome",
      "login": "Login",
      "logout": "Logout",
      "loggedIn": "Logged in",
      "language": "Language",
      "appName": "ESMuseum Maps",
      "title": "ESMuseum Maps",
      "description": "Estonian museum maps application",
      "loading": "Loading...",
      "error": "Error",
      "noMaps": "No maps found",
      "untitled": "Untitled",
      "viewMap": "View map",
      "redirecting": "Redirecting...",
      "navigation": {
        "title": "Navigation",
        "maps": "Maps",
        "requiresLogin": "Requires login",
        "kmlPlugin": "KML Plugin",
        "entuConsole": "Entu console"
      },
      "browserConsole": {
        "title": "Browser console",
        "description": "Open your browser developer console (F12) to interact with the Entu API.",
        "quickStart": "Quick start:",
        "step1": "Step 1: Get all maps",
        "step2": "Step 2: Create new entry"
      },
      "authentication": {
        "title": "Authentication",
        "description": "This console is intended for developers who want to test Entu API functionality."
      }
    },
    uk: {
      "welcome": "Ласкаво просимо",
      "login": "Увійти",
      "logout": "Вийти",
      "loggedIn": "Увійшли",
      "language": "Мова",
      "appName": "ESMuseum Карти",
      "title": "ESMuseum Карти",
      "description": "Додаток карт естонських музеїв",
      "loading": "Завантаження...",
      "error": "Помилка",
      "noMaps": "Карти не знайдено",
      "untitled": "Без назви",
      "viewMap": "Переглянути карту",
      "redirecting": "Перенаправлення...",
      "navigation": {
        "title": "Навігація",
        "maps": "Карти",
        "requiresLogin": "Потрібен вхід",
        "kmlPlugin": "KML Плагін",
        "entuConsole": "Entu консоль"
      },
      "browserConsole": {
        "title": "Консоль браузера",
        "description": "Відкрийте консоль розробника браузера (F12) для взаємодії з Entu API.",
        "quickStart": "Швидкий старт:",
        "step1": "Крок 1: Отримати всі карти",
        "step2": "Крок 2: Створити новий запис"
      },
      "authentication": {
        "title": "Автентифікація",
        "description": "Ця консоль призначена для розробників, які хочуть тестувати функціональність Entu API."
      }
    }
  },
  datetimeFormats: {
    en: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }
    },
    et: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
    },
    uk: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
    }
  },
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    fallbackLocale: 'et',
    alwaysRedirect: true
  }
}))
