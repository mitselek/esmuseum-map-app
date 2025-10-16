// @ts-expect-error - defineI18nConfig is auto-imported by Nuxt i18n
export default defineI18nConfig(() => ({
  legacy: false,
  strategy: 'no_prefix',
  fallbackWarn: false,
  missingWarn: false,
  messages: {
    et: {
      // Authentication
      alreadyLoggedIn: 'Sa oled juba sisse logitud',
      loggingIn: 'Sisselogimine...',

      continue: 'Jätka rakendusega',
      user: 'Kasutaja',

      // Authentication notifications
      auth: {
        sessionExpired: 'Sessioon aegunud',
        sessionExpiredMessage: 'Palun logi uuesti sisse',
        authRequired: 'Autentimine vajalik',
        authRequiredMessage: 'Suuname sisselogimislehele...'
      },
      // Common
      common: {
        noData: 'Andmed puuduvad',
        reload: 'Laadi uuesti',
        error: 'Viga',
        retry: 'Proovi uuesti'
      },
      login: 'Logi sisse',
      logout: 'Logi välja',
      appName: 'ESMuseum Kaardid',
      description: 'Avasta Eesti sõjaajalugu interaktiivsete asukohal põhinevate missioonide ja ajalooliste avastuste kaudu. Autentimiseks alusta oma teekonda.',

      title: 'Tere tulemast Eesti Sõjamuuseumisse',
      redirecting: 'Suunamine...',
      hello: 'Tere',
      student: 'õpilane',
      clickHere: 'Vajutage siia, kui automaatset ümbersuunamist ei toimu',
      tasks: {
        loading: 'Ülesannete laadimine...',
        initializing: 'Alustan...',
        loadingTasks: 'Laadin ülesandeid',
        selectTask: 'Vali ülesanne',
        selectTaskDescription: 'Palun vali ülesanne alustamiseks',
        title: 'Ülesanded',
        noTasks: 'Hetkel pole ühtegi ülesannet määratud',
        searchTasks: 'Otsi ülesandeid...',
        tasksFound: '{count} ülesanne leitud | {count} ülesannet leitud',
        noTasksMatchSearch: 'Otsingu järgi ülesandeid ei leitud',
        tryDifferentSearch: 'Proovi teistsugust otsingut',
        noTasksDescription: 'Ülesanded ilmuvad siia, kui need on määratud',
        responses: 'vastust',
        group: 'Grupp',
        open: 'Ava →'
      },
      gps: {

        requesting: 'Küsin asukohta',

        tryAgain: 'Proovi uuesti',
        howToEnable: 'Kuidas lubada?',
        dismiss: 'Sulge',
        // New error message translations
        error: {
          permissionTitle: 'Asukoha luba on vajalik',
          unavailableTitle: 'Asukoht pole saadaval',
          timeoutTitle: 'Asukoha päring aegus',
          genericTitle: 'Asukoha probleem',
          permissionDenied: 'Ligipääs asukohale keelati. Palun luba asukohaõigused ja proovi uuesti.',
          positionUnavailable: 'Sinu asukoht pole praegu saadaval. See võib olla tingitud halvast GPS-signaalist või keelatud asukohateenustest. Proovi minna paremasse signaali kohta või luba seadme asukohateenused.',
          timeout: 'Asukoha päring aegus. Palun proovi uuesti või veendu, et sul on hea GPS-signaal.',
          unknown: 'Ei saa sinu asukohta määrata. Palun proovi hiljem uuesti.',
          permissionRetry: 'Palun luba juurdepääs asukohale GPS-funktsioonide kasutamiseks.',
          permissionBlocked: 'Ligipääs asukohale on blokeeritud. Saad jätkata ilma GPS-ita või lubada selle brauseri seadetes.',
          continueWithoutGPS: 'Jätka ilma GPS-ita',
          serviceIssue: 'Asukohateenustega tekkis probleem.'
        }
      },
      taskDetail: {

        responsesProgress: '{actual} / {expected} vastust',
        totalResponses: '{count} vastust kokku',
        geolocationError: 'Asukoha määramisel tekkis viga: {error}',
        noTitle: 'Nimetu ülesanne',
        selectLocation: 'Vali asukoht ({count} saadaval)',

        yourResponse: 'Sinu vastus',
        addFile: 'Lisa fail (valikuline)',
        allowedFiles: 'Lubatud: pildid, PDF, Word dokumendid',
        dragDropFiles: 'Lohista failid siia või klõpsa valimiseks',
        maxFileSize: 'Maksimaalne failisuurus: 10MB',
        clickToAddMore: 'Klõpsa veel failide lisamiseks',
        fileTooLarge: 'Fail {name} on liiga suur. Maksimaalne suurus on {maxSize}.',
        fileTypeNotAllowed: 'Failitüüp pole lubatud: {name}',
        preparing: 'Valmistan ette...',

        uploadComplete: '✅ Üleslaaditud',
        uploadFailed: '❌ Ebaõnnestus',
        location: 'Asukoht',
        manualCoordinates: 'Käsitsi koordinaadid',
        close: '← Sulge',
        coordinatesFormat: 'Koordinaadid (lat,lng formaat)',
        coordinatesExample: 'näiteks: 59.4370, 24.7536',
        searchingLocation: 'Otsin asukohta...',
        useCurrentLocation: 'Kasuta praegust asukohta',
        useTheseCoordinates: 'Kasuta neid koordinaate',
        response: 'Vastus',
        responsePlaceholder: 'Kirjuta oma vastus siia...',
        submitting: 'Esitan...',
        submitResponseBtn: 'Esita vastus',
        canUpdateUntilDeadline: 'Saad oma vastust muuta kuni tähtaja lõpuni',
        responseAlreadySubmitted: '✅ Sinu vastus on esitatud',
        geolocationNotSupported: 'Geolokatsioon pole selles brauseris toetatud',
        checkingPermissions: 'Kontrollin õigusi...',
        noPermission: 'Juurdepääs keelatud',
        noPermissionDescription: 'Sul pole õigust sellele ülesandele vastata. Võta ühendust õpetajaga, kui arvad, et see on viga.',
        // Submission modal translations
        modalSubmitting: 'Saadan vastust...',
        modalSubmitSuccess: 'Vastus saadetud!',
        modalSubmitError: 'Viga saatmisel',
        // LocationPicker translations
        selectedLocation: 'Valitud asukoht',
        changeLocation: 'Muuda',
        loadingLocationsList: 'Laen asukohti...',
        searchingLocationGPS: '🔍 Otsin asukohta...',
        searchLocations: 'Otsi asukohti...',
        noLocationsForTask: 'Selle ülesande jaoks pole asukohti määratud',
        unnamedLocation: 'Nimetu asukoht',
        // User location override translations

        manualLocationOverride: 'Käsitsi asukoha määramine',
        enterManually: 'Sisesta käsitsi',
        cancel: 'Tühista',
        manualLocationHelp: 'See muudab sinu asukohta kaardi sorteerimiseks',
        applyLocation: 'Rakenda asukoht',
        clearOverride: 'Eemalda käsitsi määramine',
        manualLocationActive: 'Käsitsi määratud asukoht aktiivne',
        remove: 'Eemalda'
      },
      map: {
        yourLocation: 'Sinu asukoht'
      },
      // Onboarding
      onboarding: {
        title: 'Liitu Grupiga',
        subtitle: 'Alusta oma õppimisreisi',
        startButton: 'Alusta',
        waiting: 'Palun oota...',
        waitingSubtext: 'Kontrollime sinu liikmelisust grupis',
        error: 'Viga',
        timeout: 'Aeg sai otsa',
        timeoutMessage: 'Grupi liikmelisuse kinnitamine võttis liiga kaua aega. Palun proovi uuesti või võta ühendust õpetajaga.',
        retryButton: 'Proovi uuesti',
        nameRequired: 'Enne jätkamist vajame sinu nime',
        forename: 'Eesnimi',
        surname: 'Perekonnanimi',
        forenamePlaceholder: 'Sisesta eesnimi',
        surnamePlaceholder: 'Sisesta perekonnanimi',
        submitName: 'Jätka',
        submitting: 'Salvestamine...'
      }
    },
    en: {
      // Authentication
      alreadyLoggedIn: 'You are already logged in',
      loggingIn: 'Logging in...',

      continue: 'Continue to application',
      user: 'User',

      // Authentication notifications
      auth: {
        sessionExpired: 'Session Expired',
        sessionExpiredMessage: 'Please log in again',
        authRequired: 'Authentication Required',
        authRequiredMessage: 'Redirecting to login...'
      },
      // Common
      common: {
        noData: 'No data',
        reload: 'Reload',
        error: 'Error',
        retry: 'Retry'
      },
      login: 'Login',
      logout: 'Logout',
      appName: 'ESMuseum Maps',
      description: 'Explore Estonia\'s military history through interactive location-based missions and historical discoveries. Authenticate to begin your journey.',

      title: 'Welcome to Estonian War Museum',
      redirecting: 'Redirecting...',
      hello: 'Hello',
      student: 'student',
      clickHere: 'Click here if not redirected automatically',
      tasks: {
        loading: 'Loading tasks...',
        initializing: 'Initializing...',
        loadingTasks: 'Loading tasks',
        selectTask: 'Select a task',
        selectTaskDescription: 'Please select a task to get started',
        title: 'Tasks',
        noTasks: 'No tasks assigned yet',
        searchTasks: 'Search tasks...',
        tasksFound: '{count} task found | {count} tasks found',
        noTasksMatchSearch: 'No tasks match your search',
        tryDifferentSearch: 'Try a different search term',
        noTasksDescription: 'Tasks will appear here when they are assigned',
        responses: 'responses',
        group: 'Group',
        backToList: 'Back to list',
        hideSidebar: 'Hide sidebar',
        showSidebar: 'Show sidebar',
        taskDetails: 'Task details',
        open: 'Open →'
      },
      gps: {

        requesting: 'Requesting location',

        tryAgain: 'Try Again',
        howToEnable: 'How to Enable?',
        dismiss: 'Dismiss',
        // New error message translations
        error: {
          permissionTitle: 'Location Permission Required',
          unavailableTitle: 'Location Unavailable',
          timeoutTitle: 'Location Request Timed Out',
          genericTitle: 'Location Issue',
          permissionDenied: 'Location access was denied. Please enable location permissions and try again.',
          positionUnavailable: 'Your location is currently unavailable. This may be due to poor GPS signal or disabled location services. Try moving to a location with better signal or enable location services on your device.',
          timeout: 'Location request timed out. Please try again or ensure you have a good GPS signal.',
          unknown: 'Unable to determine your location. Please try again later.',
          permissionRetry: 'Please allow location access to enable GPS features.',
          permissionBlocked: 'Location access is blocked. You can continue without GPS or enable it in browser settings.',
          continueWithoutGPS: 'Continue without GPS',
          serviceIssue: 'There was an issue with location services.'
        }
      },
      taskDetail: {

        responsesProgress: '{actual} / {expected} responses',
        totalResponses: '{count} total responses',
        geolocationError: 'Geolocation error: {error}',
        noTitle: 'Untitled Task',
        selectLocation: 'Select location ({count} available)',

        yourResponse: 'Your Response',
        addFile: 'Add file (optional)',
        allowedFiles: 'Allowed: images, PDF, Word documents',
        dragDropFiles: 'Drag & drop files here or click to select',
        maxFileSize: 'Maximum file size: 10MB',
        clickToAddMore: 'Click to add more files',
        fileTooLarge: 'File {name} is too large. Maximum size is {maxSize}.',
        fileTypeNotAllowed: 'File type not allowed: {name}',
        preparing: 'Preparing...',

        uploadComplete: '✅ Uploaded',
        uploadFailed: '❌ Failed',
        location: 'Location',
        manualCoordinates: 'Manual coordinates',
        close: '← Close',
        coordinatesFormat: 'Coordinates (lat,lng format)',
        coordinatesExample: 'e.g.: 59.4370, 24.7536',
        searchingLocation: 'Searching for location...',
        useCurrentLocation: 'Use current location',
        useTheseCoordinates: 'Use these coordinates',
        response: 'Response',
        responsePlaceholder: 'Write your response here...',
        submitting: 'Submitting...',
        submitResponseBtn: 'Submit response',
        canUpdateUntilDeadline:
          'You can update your response until the deadline',
        responseAlreadySubmitted: '✅ Your response has been submitted',
        loadingLocations: 'Loading locations for this task\'s map',
        geolocationNotSupported: 'Geolocation is not supported in this browser',
        checkingPermissions: 'Checking permissions...',
        noPermission: 'No permission',
        noPermissionDescription: 'You don\'t have permission to respond to this task. Contact your teacher if you think this is an error.',
        // Submission modal translations
        modalSubmitting: 'Submitting response...',
        modalSubmitSuccess: 'Response submitted!',
        modalSubmitError: 'Submission error',
        // LocationPicker translations
        selectedLocation: 'Selected location',
        changeLocation: 'Change',
        loadingLocationsList: 'Loading locations...',
        searchingLocationGPS: '🔍 Searching for location...',
        searchLocations: 'Search locations...',
        noLocationsForTask: 'No locations defined for this task',
        unnamedLocation: 'Unnamed location',
        // User location override translations

        manualLocationOverride: 'Manual location override',
        enterManually: 'Enter manually',
        cancel: 'Cancel',
        manualLocationHelp: 'This will override your location for map sorting',
        applyLocation: 'Apply location',
        clearOverride: 'Clear override',
        manualLocationActive: 'Manual location override active',
        remove: 'Remove'
      },
      map: {
        yourLocation: 'Your location'
      },
      // Onboarding
      onboarding: {
        title: 'Join Group',
        subtitle: 'Start your learning journey',
        startButton: 'Get Started',
        waiting: 'Please wait...',
        waitingSubtext: 'We are verifying your group membership',
        error: 'Error',
        timeout: 'Timed Out',
        timeoutMessage: 'Confirming group membership took too long. Please try again or contact your teacher.',
        retryButton: 'Try Again',
        nameRequired: 'We need your name before continuing',
        forename: 'First Name',
        surname: 'Last Name',
        forenamePlaceholder: 'Enter your first name',
        surnamePlaceholder: 'Enter your last name',
        submitName: 'Continue',
        submitting: 'Saving...'
      }
    },
    uk: {
      // Authentication
      alreadyLoggedIn: 'Ви вже увійшли в систему',
      loggingIn: 'Вхід...',

      continue: 'Продовжити до додатку',
      user: 'Користувач',

      // Authentication notifications
      auth: {
        sessionExpired: 'Сесія закінчилася',
        sessionExpiredMessage: 'Будь ласка, увійдіть знову',
        authRequired: 'Потрібна автентифікація',
        authRequiredMessage: 'Перенаправлення на сторінку входу...'
      },
      // Common
      common: {
        noData: 'Немає даних',
        reload: 'Перезавантажити',
        error: 'Помилка',
        retry: 'Спробувати ще раз'
      },
      login: 'Увійти',
      logout: 'Вийти',
      appName: 'ESMuseum Карти',
      description: 'Досліджуйте військову історію Естонії через інтерактивні місцеві місії та історичні відкриття. Автентифікуйтеся, щоб розпочати свою подорож.',

      title: 'Ласкаво просимо до Естонського військового музею',
      redirecting: 'Перенаправлення...',
      hello: 'Привіт',
      student: 'студент',
      clickHere: 'Натисніть тут, якщо автоматичне перенаправлення не відбувається',
      tasks: {
        loading: 'Завантаження завдань...',
        initializing: 'Ініціалізація...',
        loadingTasks: 'Завантаження завдань',
        selectTask: 'Вибрати завдання',
        selectTaskDescription: 'Будь ласка, виберіть завдання для початку',
        title: 'Завдання',
        noTasks: 'Наразі завдання не призначені',
        searchTasks: 'Пошук завдань...',
        tasksFound: '{count} завдання знайдено | {count} завдання знайдено | {count} завдань знайдено',
        noTasksMatchSearch: 'Жодного завдання не відповідає вашому пошуку',
        tryDifferentSearch: 'Спробуйте інший пошуковий запит',
        noTasksDescription: 'Завдання з\'являться тут після призначення',
        responses: 'відповідей',
        group: 'Група',
        open: 'Відкрити →'
      },
      gps: {

        requesting: 'Запит місцезнаходження',

        tryAgain: 'Спробувати знову',
        howToEnable: 'Як увімкнути?',
        dismiss: 'Закрити',
        // New error message translations
        error: {
          permissionTitle: 'Потрібен дозвіл на місцезнаходження',
          unavailableTitle: 'Місцезнаходження недоступне',
          timeoutTitle: 'Час очікування місцезнаходження закінчився',
          genericTitle: 'Проблема з місцезнаходженням',
          permissionDenied: 'Доступ до місцезнаходження заборонено. Будь ласка, увімкніть дозволи на місцезнаходження та спробуйте знову.',
          positionUnavailable: 'Ваше місцезнаходження наразі недоступне. Це може бути через поганий GPS-сигнал або вимкнені служби місцезнаходження. Спробуйте перейти в місце з кращим сигналом або увімкніть служби місцезнаходження на пристрої.',
          timeout: 'Час очікування запиту місцезнаходження закінчився. Будь ласка, спробуйте знову або переконайтеся, що у вас хороший GPS-сигнал.',
          unknown: 'Неможливо визначити ваше місцезнаходження. Будь ласка, спробуйте пізніше.',
          permissionRetry: 'Будь ласка, дозвольте доступ до місцезнаходження для увімкнення GPS-функцій.',
          permissionBlocked: 'Доступ до місцезнаходження заблоковано. Ви можете продовжити без GPS або увімкнути його в налаштуваннях браузера.',
          continueWithoutGPS: 'Продовжити без GPS',
          serviceIssue: 'Виникла проблема зі службами місцезнаходження.'
        }
      },
      taskDetail: {

        responsesProgress: '{actual} / {expected} відповідей',
        totalResponses: '{count} всього відповідей',
        geolocationError: 'Помилка геолокації: {error}',
        noTitle: 'Завдання без назви',
        selectLocation: 'Виберіть місцезнаходження ({count} доступно)',

        yourResponse: 'Ваша відповідь',
        addFile: 'Додати файл (необов\'язково)',
        allowedFiles: 'Дозволено: зображення, PDF, документи Word',
        dragDropFiles: 'Перетягніть файли сюди або клацніть для вибору',
        maxFileSize: 'Максимальний розмір файлу: 10МБ',
        clickToAddMore: 'Клацніть, щоб додати більше файлів',
        fileTooLarge: 'Файл {name} занадто великий. Максимальний розмір {maxSize}.',
        fileTypeNotAllowed: 'Тип файлу не дозволений: {name}',
        preparing: 'Підготовка...',

        uploadComplete: '✅ Завантажено',
        uploadFailed: '❌ Помилка',
        location: 'Розташування',
        manualCoordinates: 'Ручні координати',
        close: '← Закрити',
        coordinatesFormat: 'Координати (формат lat,lng)',
        coordinatesExample: 'наприклад: 59.4370, 24.7536',
        searchingLocation: 'Пошук місцезнаходження...',
        useCurrentLocation: 'Використати поточне місцезнаходження',
        useTheseCoordinates: 'Використати ці координати',
        response: 'Відповідь',
        responsePlaceholder: 'Напишіть вашу відповідь тут...',
        submitting: 'Подання...',
        submitResponseBtn: 'Подати відповідь',
        canUpdateUntilDeadline:
          'Ви можете оновлювати відповідь до кінцевого терміну',
        responseAlreadySubmitted: '✅ Ваша відповідь подана',
        geolocationNotSupported: 'Геолокація не підтримується в цьому браузері',
        checkingPermissions: 'Перевірка дозволів...',
        noPermission: 'Немає дозволу',
        noPermissionDescription: 'У вас немає дозволу відповідати на це завдання. Зверніться до вчителя, якщо ви вважаєте, що це помилка.',
        // Submission modal translations
        modalSubmitting: 'Надсилання відповіді...',
        modalSubmitSuccess: 'Відповідь надіслано!',
        modalSubmitError: 'Помилка надсилання',
        // LocationPicker translations
        selectedLocation: 'Вибране місце',
        changeLocation: 'Змінити',
        loadingLocationsList: 'Завантаження місць...',
        searchingLocationGPS: '🔍 Пошук місцезнаходження...',
        searchLocations: 'Пошук місць...',
        noLocationsForTask: 'Для цього завдання не визначено місць',
        unnamedLocation: 'Місце без назви',
        // User location override translations

        manualLocationOverride: 'Ручне перевизначення місцезнаходження',
        enterManually: 'Ввести вручну',
        cancel: 'Скасувати',
        manualLocationHelp:
          'Це перевизначить ваше місцезнаходження для сортування карти',
        applyLocation: 'Застосувати місцезнаходження',
        clearOverride: 'Очистити перевизначення',
        manualLocationActive: 'Ручне перевизначення місцезнаходження активне',
        remove: 'Видалити'
      },
      map: {
        yourLocation: 'Ваше місцезнаходження'
      },
      // Onboarding
      onboarding: {
        title: 'Приєднатися до групи',
        subtitle: 'Розпочніть свій навчальний шлях',
        startButton: 'Розпочати',
        waiting: 'Будь ласка, зачекайте...',
        waitingSubtext: 'Ми перевіряємо ваше членство в групі',
        error: 'Помилка',
        timeout: 'Час очікування вичерпано',
        timeoutMessage: 'Підтвердження членства в групі зайняло занадто багато часу. Будь ласка, спробуйте ще раз або зверніться до вчителя.',
        retryButton: 'Спробувати ще раз',
        nameRequired: 'Нам потрібно ваше ім\'я перед продовженням',
        forename: 'Ім\'я',
        surname: 'Прізвище',
        forenamePlaceholder: 'Введіть ваше ім\'я',
        surnamePlaceholder: 'Введіть ваше прізвище',
        submitName: 'Продовжити',
        submitting: 'Збереження...'
      }
    },
    lv: {
      // Authentication
      alreadyLoggedIn: 'Jūs jau esat pieteicies',
      loggingIn: 'Piesakos...',

      continue: 'Turpināt uz lietotni',
      user: 'Lietotājs',

      // Authentication notifications
      auth: {
        sessionExpired: 'Sesija beigusies',
        sessionExpiredMessage: 'Lūdzu, piesakieties vēlreiz',
        authRequired: 'Nepieciešama autentifikācija',
        authRequiredMessage: 'Pārvirza uz pieteikšanās lapu...'
      },
      // Common
      common: {
        noData: 'Nav datu',
        reload: 'Pārlādēt',
        error: 'Kļūda',
        retry: 'Mēģināt vēlreiz'
      },
      login: 'Pieteikties',
      logout: 'Izrakstīties',
      appName: 'ESMuseum Kartes',
      description: 'Izpētiet Igaunijas militāro vēsturi, izmantojot interaktīvās uz atrašanās vietu balstītās misijas un vēsturiskos atklājumus. Autentificējieties, lai sāktu savu ceļojumu.',

      title: 'Laipni lūdzam Igaunijas Kara muzejā',
      redirecting: 'Pārvirza...',
      hello: 'Sveiki',
      student: 'skolēns',
      clickHere: 'Noklikšķiniet šeit, ja automātiskā pārvirzīšana nenotiek',
      tasks: {
        loading: 'Ielādē uzdevumus...',
        initializing: 'Inicializē...',
        loadingTasks: 'Ielādē uzdevumus',
        selectTask: 'Izvēlieties uzdevumu',
        selectTaskDescription: 'Lūdzu, izvēlieties uzdevumu, lai sāktu',
        title: 'Uzdevumi',
        noTasks: 'Pagaidām nav neviena piešķirta uzdevuma',
        searchTasks: 'Meklēt uzdevumus...',
        tasksFound: '{count} uzdevums atrasts | {count} uzdevumi atrasti',
        noTasksMatchSearch: 'Neviens uzdevums neatbilst jūsu meklēšanai',
        tryDifferentSearch: 'Mēģiniet citu meklēšanas terminu',
        noTasksDescription: 'Uzdevumi parādīsies šeit, kad tie tiks piešķirti',
        responses: 'atbildes',
        group: 'Grupa',
        open: 'Atvērt →'
      },
      gps: {

        requesting: 'Pieprasa atrašanās vietu',

        tryAgain: 'Mēģināt vēlreiz',
        howToEnable: 'Kā iespējot?',
        dismiss: 'Aizvērt',
        // New error message translations
        error: {
          permissionTitle: 'Nepieciešama atrašanās vietas atļauja',
          unavailableTitle: 'Atrašanās vieta nav pieejama',
          timeoutTitle: 'Atrašanās vietas pieprasījuma laiks iztecējis',
          genericTitle: 'Atrašanās vietas problēma',
          permissionDenied: 'Piekļuve atrašanās vietai tika liegta. Lūdzu, iespējojiet atrašanās vietas atļaujas un mēģiniet vēlreiz.',
          positionUnavailable: 'Jūsu atrašanās vieta pašlaik nav pieejama. Tas var būt slikta GPS signāla vai atspējotu atrašanās vietas pakalpojumu dēļ. Mēģiniet pāriet uz vietu ar labāku signālu vai iespējojiet atrašanās vietas pakalpojumus savā ierīcē.',
          timeout: 'Atrašanās vietas pieprasījuma laiks iztecējis. Lūdzu, mēģiniet vēlreiz vai pārliecinieties, ka jums ir labs GPS signāls.',
          unknown: 'Nevar noteikt jūsu atrašanās vietu. Lūdzu, mēģiniet vēlāk.',
          permissionRetry: 'Lūdzu, atļaujiet piekļuvi atrašanās vietai, lai iespējotu GPS funkcijas.',
          permissionBlocked: 'Piekļuve atrašanās vietai ir bloķēta. Varat turpināt bez GPS vai iespējot to pārlūkprogrammas iestatījumos.',
          continueWithoutGPS: 'Turpināt bez GPS',
          serviceIssue: 'Radās problēma ar atrašanās vietas pakalpojumiem.'
        }
      },
      taskDetail: {

        responsesProgress: '{actual} / {expected} atbildes',
        totalResponses: '{count} atbildes kopā',
        geolocationError: 'Ģeolokācijas kļūda: {error}',
        noTitle: 'Uzdevums bez nosaukuma',
        selectLocation: 'Izvēlieties atrašanās vietu ({count} pieejamas)',

        yourResponse: 'Jūsu atbilde',
        addFile: 'Pievienot failu (neobligāti)',
        allowedFiles: 'Atļauti: attēli, PDF, Word dokumenti',
        dragDropFiles: 'Velciet failus šeit vai noklikšķiniet, lai izvēlētos',
        maxFileSize: 'Maksimālais faila izmērs: 10MB',
        clickToAddMore: 'Noklikšķiniet, lai pievienotu vēl failus',
        fileTooLarge: 'Fails {name} ir pārāk liels. Maksimālais izmērs ir {maxSize}.',
        fileTypeNotAllowed: 'Faila tips nav atļauts: {name}',
        preparing: 'Sagatavo...',

        uploadComplete: '✅ Augšupielādēts',
        uploadFailed: '❌ Neizdevās',
        location: 'Atrašanās vieta',
        manualCoordinates: 'Manuālās koordinātas',
        close: '← Aizvērt',
        coordinatesFormat: 'Koordinātas (lat,lng formāts)',
        coordinatesExample: 'piemēram: 59.4370, 24.7536',
        searchingLocation: 'Meklē atrašanās vietu...',
        useCurrentLocation: 'Izmantot pašreizējo atrašanās vietu',
        useTheseCoordinates: 'Izmantot šīs koordinātas',
        response: 'Atbilde',
        responsePlaceholder: 'Rakstiet savu atbildi šeit...',
        submitting: 'Iesniedz...',
        submitResponseBtn: 'Iesniegt atbildi',
        canUpdateUntilDeadline: 'Varat atjaunināt savu atbildi līdz termiņa beigām',
        responseAlreadySubmitted: '✅ Jūsu atbilde ir iesniegta',
        geolocationNotSupported: 'Ģeolokācija netiek atbalstīta šajā pārlūkprogrammā',
        checkingPermissions: 'Pārbauda atļaujas...',
        noPermission: 'Nav atļaujas',
        noPermissionDescription: 'Jums nav atļaujas atbildēt uz šo uzdevumu. Sazinieties ar skolotāju, ja domājat, ka tas ir kļūda.',
        // Submission modal translations
        modalSubmitting: 'Iesniedz atbildi...',
        modalSubmitSuccess: 'Atbilde iesniegta!',
        modalSubmitError: 'Iesniegšanas kļūda',
        // LocationPicker translations
        selectedLocation: 'Izvēlētā atrašanās vieta',
        changeLocation: 'Mainīt',
        loadingLocationsList: 'Ielādē atrašanās vietas...',
        searchingLocationGPS: '🔍 Meklē atrašanās vietu...',
        searchLocations: 'Meklēt atrašanās vietas...',
        noLocationsForTask: 'Šim uzdevumam nav definētas atrašanās vietas',
        unnamedLocation: 'Atrašanās vieta bez nosaukuma',
        // User location override translations

        manualLocationOverride: 'Manuāla atrašanās vietas pārrakstīšana',
        enterManually: 'Ievadīt manuāli',
        cancel: 'Atcelt',
        manualLocationHelp: 'Tas pārrakstīs jūsu atrašanās vietu kartes kārtošanai',
        applyLocation: 'Lietot atrašanās vietu',
        clearOverride: 'Notīrīt pārrakstīšanu',
        manualLocationActive: 'Manuāla atrašanās vietas pārrakstīšana aktīva',
        remove: 'Noņemt'
      },
      map: {
        yourLocation: 'Jūsu atrašanās vieta'
      },
      // Onboarding
      onboarding: {
        title: 'Pievienoties grupai',
        subtitle: 'Sāciet savu mācību ceļojumu',
        startButton: 'Sākt',
        waiting: 'Lūdzu, uzgaidiet...',
        waitingSubtext: 'Mēs pārbaudām jūsu dalību grupā',
        error: 'Kļūda',
        timeout: 'Laiks iztecējis',
        timeoutMessage: 'Dalības grupā apstiprināšana ilga pārāk ilgi. Lūdzu, mēģiniet vēlreiz vai sazinieties ar skolotāju.',
        retryButton: 'Mēģināt vēlreiz',
        nameRequired: 'Mums ir nepieciešams jūsu vārds pirms turpināšanas',
        forename: 'Vārds',
        surname: 'Uzvārds',
        forenamePlaceholder: 'Ievadiet savu vārdu',
        surnamePlaceholder: 'Ievadiet savu uzvārdu',
        submitName: 'Turpināt',
        submitting: 'Saglabā...'
      }
    }
  },
  datetimeFormats: {
    en: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    },
    et: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }
    },
    uk: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }
    },
    lv: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      datetime: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }
    }
  },
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    fallbackLocale: 'et',
    alwaysRedirect: true
  }
}))
