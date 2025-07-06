<script setup>
// Define middleware to require authentication
definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <div>
    <AppHeader />
    <div class="container mx-auto px-4 py-8">
      <h1 class="mb-6 text-3xl font-bold">
        {{ $t('title') }}
      </h1>

      <div class="prose lg:prose-xl">
        <div class="mb-8">
          <h2 class="mb-3 text-2xl font-semibold">
            {{ $t('browserConsole.title') }}
          </h2>
          <p>{{ $t('browserConsole.description') }}</p>

          <div class="mt-4 rounded-md bg-gray-100 p-4 font-mono">
            <p>// {{ $t('browserConsole.quickStart') }}</p>
            <p class="text-blue-600">
              entu.quickInfo()
            </p>

            <p class="my-2">
              // {{ $t('browserConsole.step1') }}
            </p>
            <p class="text-blue-600">
              entu.init()
            </p>

            <p class="my-2">
              // {{ $t('browserConsole.step2') }}
            </p>
            <p class="text-blue-600">
              entu.getAccountInfo()
            </p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="mb-3 text-2xl font-semibold">
            {{ $t('authentication.title') }}
          </h2>
          <p>{{ $t('authentication.description') }}</p>

          <h3 class="mb-2 mt-4 text-xl font-semibold">
            {{ $t('authentication.apiKey') }}
          </h3>
          <p>{{ $t('authentication.apiKeyDescription') }}</p>

          <h3 class="mb-2 mt-4 text-xl font-semibold">
            {{ $t('authentication.oauth') }}
          </h3>
          <p>{{ $t('authentication.oauthDescription') }}</p>
          <p>{{ $t('authentication.oauthRedirectDescription') }}</p>
          <p>{{ $t('authentication.availableProviders') }}</p>

          <ul class="mb-4 ml-6 list-disc">
            <li>Google</li>
            <li>Apple</li>
            <li>Smart-ID</li>
            <li>Mobile-ID</li>
            <li>ID-Card (Estonian ID)</li>
          </ul>

          <div class="mt-2 rounded-md bg-gray-100 p-4 font-mono">
            <p class="text-blue-600">
              // {{ $t('authentication.oauthEndpoint') }}
              GET https://entu.app/api/auth/google?account=esmuuseum&next=https://yourdomain.com/auth/callback
            </p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="mb-3 text-2xl font-semibold">
            {{ $t('availableMethods.title') }}
          </h2>
          <ul class="list-inside list-disc">
            <li class="mb-2">
              <code>entu.quickInfo()</code> - {{ $t('availableMethods.quickInfo') }}
            </li>
            <li class="mb-2">
              <code>entu.getAuthResponse()</code> - {{ $t('availableMethods.getAuthResponse') }}
            </li>
            <li class="mb-2">
              <code>entu.getAccountInfo()</code> - {{ $t('availableMethods.getAccountInfo') }}
            </li>
            <li class="mb-2">
              <code>entu.getEntityTypes()</code> - {{ $t('availableMethods.getEntityTypes') }}
            </li>
            <li class="mb-2">
              <code>entu.getEntitiesByType(type, props, limit)</code> - {{ $t('availableMethods.getEntitiesByType') }}
            </li>
            <li class="mb-2">
              <code>entu.getEntity(entityId)</code> - {{ $t('availableMethods.getEntity') }}
            </li>
            <li class="mb-2">
              <code>entu.searchEntities(query)</code> - {{ $t('availableMethods.searchEntities') }}
            </li>
          </ul>
        </div>

        <div class="mb-8">
          <h2 class="mb-3 text-2xl font-semibold">
            {{ $t('examples.title') }}
          </h2>

          <h3 class="my-3 text-xl font-medium">
            {{ $t('examples.findKaartEntities') }}
          </h3>
          <div class="rounded-md bg-gray-100 p-4 font-mono">
            <p class="text-blue-600">
              entu.getEntitiesByType('kaart')
            </p>
          </div>

          <h3 class="my-3 text-xl font-medium">
            {{ $t('examples.findEntityById') }}
          </h3>
          <div class="rounded-md bg-gray-100 p-4 font-mono">
            <p class="text-blue-600">
              entu.getEntity('686913e11749f351b9c82f1c')
            </p>
          </div>

          <h3 class="my-3 text-xl font-medium">
            {{ $t('examples.advancedSearch') }}
          </h3>
          <div class="rounded-md bg-gray-100 p-4 font-mono">
            <p class="text-blue-600">
              entu.searchEntities({'_type.string': 'kaart', 'name.string': 'test'})
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  title: Entu API Browser Console
  browserConsole:
    title: Using the Browser Console for Entu API
    description: "This page explains how to use the browser console to interact directly with the Entu API. Open your browser's developer tools (F12 or Ctrl+Shift+I / Cmd+Option+I) and follow these steps:"
    quickStart: "For a quick overview of your account, use:"
    step1: "To initialize the Entu API helper for all methods:"
    step2: "Then, you can call any of the available methods, for example:"
  authentication:
    title: Authentication Methods
    description: "ESMuseum Map App supports two authentication methods for accessing the Entu API:"
    apiKey: "API Key Authentication"
    apiKeyDescription: "Using a fixed API key from the application's configuration for direct authentication."
    oauth: "OAuth Authentication"
    oauthDescription: "Authentication through OAuth.ee service with specific providers, allowing for a more secure authentication flow."
    oauthRedirectDescription: "The OAuth flow redirects the user to the OAuth.ee service and then back to the application with a temporary API key. After successful authentication, the temporary key is used to get the JWT token from the /api/auth endpoint."
    availableProviders: "The following authentication providers are supported:"
    oauthEndpoint: "Example OAuth redirect URL with Google provider:"
  availableMethods:
    title: Available Methods
    quickInfo: Get a quick summary of account information and entity types
    getAuthResponse: Get the complete authentication response with token and user information
    getAccountInfo: Get information about the current Entu account
    getEntityTypes: List all entity types in the account
    getEntitiesByType: Get entities of a specific type
    getEntity: Get a specific entity by ID
    searchEntities: Search for entities using a query object
  examples:
    title: Examples
    findKaartEntities: Find all Map (kaart) entities
    findEntityById: Find an entity by its ID
    advancedSearch: Perform an advanced search
et:
  title: Entu API brauseri konsool
  browserConsole:
    title: Entu API kasutamine brauseri konsoolis
    description: "See lehekülg selgitab, kuidas kasutada brauseri konsooli, et suhelda otse Entu API-ga. Ava oma brauseri arendaja tööriistad (F12 või Ctrl+Shift+I / Cmd+Option+I) ja järgi neid samme:"
    quickStart: "Konto kiireks ülevaateks kasuta:"
    step1: "Entu API abivahendi käivitamiseks kõigi meetodite jaoks:"
    step2: "Seejärel saad kasutada saadaolevaid meetodeid, näiteks:"
  authentication:
    title: Autentimise meetodid
    description: "ESMuseum Map App toetab kahte autentimise meetodit Entu API juurdepääsuks:"
    apiKey: "API võtme autentimine"
    apiKeyDescription: "Rakenduse konfiguratsioonist fikseeritud API võtme kasutamine otseseks autentimiseks."
    oauth: "OAuth autentimine"
    oauthDescription: "Autentimine läbi OAuth.ee teenuse konkreetsete pakkujatega, võimaldades turvalisemat autentimisvoogu."
    oauthRedirectDescription: "OAuth voog suunab kasutaja OAuth.ee teenusesse ja seejärel tagasi rakendusse ajutise API võtmega. Pärast edukat autentimist kasutatakse ajutist võtit, et saada JWT token /api/auth otspunktist."
    availableProviders: "Toetatud on järgmised autentimisteenuse pakkujad:"
    oauthEndpoint: "Näide OAuth ümbersuunamise URL-ist Google pakkujaga:"
  availableMethods:
    title: Saadaolevad meetodid
    quickInfo: Hangi kiire ülevaade konto teabest ja üksuste tüüpidest
    getAuthResponse: Hangi täielik autentimise vastus koos tokeni ja kasutaja teabega
    getAccountInfo: Hangi teavet praeguse Entu konto kohta
    getEntityTypes: Kuva kõik konto üksuste tüübid
    getEntitiesByType: Hangi teatud tüüpi üksused
    getEntity: Hangi konkreetne üksus ID järgi
    searchEntities: Otsi üksusi päringuobjekti abil
  examples:
    title: Näited
    findKaartEntities: Leia kõik kaardi üksused
    findEntityById: Leia üksus ID järgi
    advancedSearch: Teosta täpsem otsing
</i18n>
