```
# Resumo Analítico: Arquitetura de Ecossistemas Mobile e API com Laravel 11+ e NativePHP v3

## 1. Princípios Arquiteturais Base (Clean Architecture)
A fundação de qualquer API robusta ou backend mobile exige separação estrita de responsabilidades, garantindo testabilidade e manutenibilidade.

*   **Thin Controllers:** Controladores devem atuar apenas como orquestradores de tráfego HTTP. Instanciam DTOs a partir de requisições validadas e delegam a execução para a camada de `Service` ou `Action`.
*   **Form Requests:** Toda validação de input e regras de autorização primárias devem ser isoladas nestas classes.
*   **Data Transfer Objects (DTOs):** Estruturas fortemente tipadas (classes `readonly`) para transportar dados entre a camada HTTP e a camada de domínio, eliminando o uso de arrays associativos obscuros.
*   **Actions / Services:** Onde a regra de negócios reside. Totalmente agnósticos de HTTP, facilitando a reutilização via comandos Artisan, Jobs ou WebSockets.
*   **Repositories:** Abstraem o Eloquent ORM. Previnem consultas complexas espalhadas pela aplicação e centralizam regras de *Eager Loading* para evitar queries N+1.
*   **API Resources:** Camada de transformação obrigatória para padronizar contratos JSON, ocultar colunas sensíveis da base de dados e formatar tipos primitivos.

> Importante: Padrão Arquitetural Ruim vs Bom
> ❌ **Ruim:** Controllers "gordos" que validam requisições, aplicam regras de negócios, fazem queries complexas via Eloquent e retornam respostas formatadas manualmente.
> ✅ **Bom:** Fluxo estrito: `Route` -> `Form Request` -> `Controller` -> `DTO` -> `Action/Service` -> `Repository` -> `API Resource`.

## 2. Estratégia de Autenticação (Sanctum vs Passport)
O ecossistema Laravel dita padrões claros para autenticação moderna, despriorizando o uso de pacotes JWT de terceiros.

*   **Laravel Sanctum (Padrão Ouro para First-Party):** Solução mandatória para Single Page Applications (SPAs) do mesmo domínio via Stateful Cookies (proteção nativa contra XSS/CSRF) e para aplicativos mobile proprietários via API Tokens leves.
*   **Laravel Passport (Para Ecossistemas OAuth2):** Implementação completa do servidor OAuth2. Deve ser utilizado apenas quando a arquitetura exige integrações de terceiros (ex: "Log in with MyApp"), microsserviços distribuídos ou permissões granulares por *Scopes* rigorosos.

> Importante: Armazenamento de Tokens Mobile
> ❌ **Ruim:** Armazenar tokens de API em texto plano no `SharedPreferences` (Android), `localStorage` (WebViews) ou SQLite local.
> ✅ **Bom:** Delegar a criptografia ao hardware do dispositivo usando `EncryptedSharedPreferences` (Android Keystore) ou `Keychain` (iOS), injetados via `Interceptor` no OkHttp (Kotlin) ou usando o plugin `nativephp/mobile-secure-storage` (NativePHP).

## 3. Ecossistema Mobile: NativePHP v3 vs Android Nativo
A decisão da stack mobile dita o consumo de recursos e o modelo de comunicação.

*   **NativePHP v3 (Air):** Framework gratuito e modular que embarca o runtime do PHP e um banco SQLite no dispositivo do usuário. Ideal para apps *offline-first* gerados pela mesma equipe web, usando plugins via Composer (Câmera, Biometria, Geolocation) para acessar hardware.
*   **Android Nativo (Kotlin/Java):** Consome a API remotamente. Requer arquitetura de rede sólida, utilizando a combinação padrão da indústria: `Retrofit` (Type-safe API client) e `OkHttp` (Interceptors para injeção automática de Headers de Autenticação, Logs e cache).
*   **Segurança em WebViews:** Se o app usar WebViews para renderizar componentes, desative a execução de JavaScript (`setJavaScriptEnabled(false)`) se não for estritamente necessária e evite `addJavascriptInterface` para mitigar ataques XSS e manipulação da ponte nativa.

> Importante: Entendimento do Runtime NativePHP
> ❌ **Ruim:** Tratar o NativePHP como uma API web convencional, ignorando o consumo de bateria/CPU do celular para rodar o interpretador PHP localmente.
> ✅ **Bom:** Otimizar migrations SQLite com índices, usar paginação em memória (chunking) e delegar processamento pesado para Jobs locais baseados em banco de dados.

## 4. Sincronização de Dados e Offline-First
Para apps mobile que operam com banco local (SQLite via NativePHP) sincronizando com a nuvem (MariaDB/PostgreSQL via API).

*   **Chaves Primárias Universais:** O uso de UUIDs ou ULIDs é arquiteturalmente mandatório.
*   **Background Syncing:** Operações de criação/edição são persistidas primeiro no banco local. Um `Job` é despachado para a Queue local e tenta envio assíncrono via `Http::withToken()`.
*   **Verificação de Conectividade:** Utilize plugins (ex: `nativephp/mobile-network`) para abortar Jobs de sincronização prematuramente se o dispositivo estiver offline.
*   **Resolução de Conflitos (Nuvem):** A API receptora no backend Laravel deve processar os dados usando a operação de *Upsert* (Update or Insert) baseada no UUID, garantindo a idempotência da requisição HTTP.

> Importante: Modelagem de IDs
> ❌ **Ruim:** Utilizar `$table->id()` (Auto-Increment) em bancos locais e na nuvem, resultando em colisões de IDs durante a sincronização de múltiplos dispositivos.
> ✅ **Bom:** Utilizar `$table->uuid('id')->primary()` no SQLite do dispositivo e no banco central em nuvem.

## 5. Comunicação Real-Time (Laravel Reverb)
A era do *polling* HTTP acabou. O Laravel Reverb introduz comunicação via WebSockets de primeira classe e alta performance.

*   **Protocolo Pusher:** O Reverb utiliza o protocolo Pusher, permitindo o uso imediato do Laravel Echo no frontend.
*   **Gestão de Canais (Channels):** Utilizar *Public Channels* para dados abertos, *Private Channels* para dados restritos (requer auth/checagem de propriedade) e *Presence Channels* para rastrear usuários online (colaboração).
*   **Escalabilidade Horizontal:** Configuração via Redis Pub/Sub permite que o Reverb distribua mensagens através de múltiplos servidores WebSocket de forma transparente quando o tráfego escalar.

## 6. Performance e Otimização de API
Métricas de escalabilidade não dependem apenas do código, mas também de infraestrutura e otimização do payload.

*   **Compressão de Payload:** Aplicar compressão Gzip ou Brotli via Nginx ou Middleware para reduzir o payload JSON (ex: de 500KB para 50KB), essencial para redes 3G/4G instáveis.
*   **Database Optimization:** Mitigar consultas N+1 via Eager Loading (`with()`). Empregar cache distribuído (Redis) para rotas de leitura pesada e dados com baixa volatilidade.
*   **Paginação e Filtragem (Sparse Fieldsets):** Devolver metadados padronizados e permitir que o cliente escolha os campos necessários (`?fields=name,email`) para economizar banda.

> Importante: Caching
> ❌ **Ruim:** Confundir cache local do dispositivo (IndexedDB, SQLite) com cache de servidor (Redis).
> ✅ **Bom:** O Redis vive no servidor e poupa o Banco SQL. O cache local vive no celular e poupa requisições de rede. Ambos devem existir em arquiteturas distribuídas.

## 7. Segurança e Publicação (Google Play 2026)
Regras de negócios estritas impostas pelas lojas de aplicativos e diretrizes de infraestrutura.

*   **Google Play Testing:** Aplicativos novos exigem 14 dias de Teste Fechado com pelo menos 12 testadores engajados organicamente com contas reais em dispositivos físicos (emuladores causam rejeição).
*   **Verificação de Desenvolvedor (2026):** Todos os apps Android, públicos (AAB/APK) ou corporativos (Sideloading/MDM), deverão ser assinados por desenvolvedores verificados com D-U-N-S number. Instalações anônimas serão bloqueadas a nível de SO.
*   **Zero Trust e API Security:** Rate Limiting por IP/User configurado no middleware, proteção contra Mass Assignment, requisição forçada por HTTPS (uso de `usesCleartextTraffic="false"` no Android) e versionamento estrito de rotas de API (`/api/v1/`).
```
```
# Resumo Analítico: NativePHP Mobile v3 (Air) - Diretrizes e Arquitetura

## 1. Requisitos de Sistema e Infraestrutura Base
O NativePHP v3 (Air) não é um wrapper de WebView tradicional. Ele embute um interpretador PHP pré-compilado diretamente em um *shell* Swift (iOS) ou Kotlin (Android).

*   **Linguagem e Framework:** Requer estritamente PHP 8.2+ (versões 8.3 ou 8.4 recomendadas) e Laravel 11+.
*   **Offline-First:** O aplicativo roda 100% no dispositivo (on-device), sem necessidade de um servidor web (Nginx/Apache).
*   **Banco de Dados:** O uso do SQLite é arquiteturalmente mandatório. O banco de dados opera isolado dentro do armazenamento do celular.

> Importante: Arquitetura Cliente-Servidor vs Embarcada
> ❌ **Ruim:** Configurar o `.env` do NativePHP apontando para um banco MySQL/PostgreSQL remoto. Isso causará falhas de latência e quebra de acesso offline.
> ✅ **Bom:** Configurar `DB_CONNECTION=sqlite`. Dados remotos devem ser consumidos via API RESTful usando `Http::client()` e sincronizados com o banco local em background.

## 2. Sistema Modular de Plugins (Arquitetura V3)
Na versão 3, o núcleo (core) tornou-se minimalista e de código aberto (MIT). Todo o acesso ao hardware nativo foi extraído para um sistema de plugins via Composer.

*   **Instalação e Registro:** Não basta usar o Composer. Todo plugin exige o registro da *bridge* Swift/Kotlin no momento do build.
    ```bash
    composer require nativephp/mobile-network
    php artisan native:plugin:register nativephp/mobile-network
    ```
*   **Comunicação Nativa (The Bridge):** O código PHP utiliza *Facades* para enviar instruções, e *Events* para receber callbacks do sistema operacional.
*   **Escuta de Eventos:** Utilize o atributo `#[OnNative]` em componentes Livewire ou classes PHP para interceptar eventos de hardware.

> Importante: Gerenciamento de Dependências Nativas
> ❌ **Ruim:** Tentar adicionar dependências Gradle ou CocoaPods manualmente para acessar recursos do celular.
> ✅ **Bom:** Criar ou utilizar um Plugin NativePHP. O plugin encapsula o manifesto, permissões e dependências nativas, compilando-as de forma segura no processo de build.

## 3. Segurança e Gerenciamento de Estado
A execução de código backend no dispositivo do usuário (Client-side) expõe variáveis de ambiente e regras de negócio. A segurança deve ser tratada como em aplicações de *frontend/mobile* puro.

*   **Tokens e Credenciais:** Nunca armazene Access Tokens (Sanctum/OAuth) em SQLite local, `.env` ou LocalStorage. O armazenamento em texto plano em dispositivos com *root/jailbreak* é uma vulnerabilidade crítica.
*   **Secure Storage Plugin:** Utilize obrigatoriamente o pacote premium `nativephp/mobile-secure-storage` para interagir com o Android Keystore ou iOS Keychain.
*   **Permissões:** O manifesto do aplicativo deve declarar estritamente as permissões de hardware utilizadas. Acessar plugins sem declarar a intenção no OS causará *crashes* silenciosos.

## 4. Plugins: Free vs Premium
O ecossistema divide as integrações de hardware entre utilitários open-source e integrações avançadas (pagamento único via licença *lifetime*).

*   **Core / Free Plugins (MIT):** Network, Camera, Device, Dialog, File, Microphone, Share, System, Browser.
*   **Premium Plugins:** Biometrics (Face ID/Fingerprint), Geolocation, Push Notifications (FCM/APNs), Scanner (QR/Barcode) e Secure Storage.

## 5. Testabilidade e Deploy (NativePHP Jump)
A configuração de emuladores nativos (Android Studio / Xcode) adiciona atrito desnecessário e consome recursos massivos da máquina de desenvolvimento.

*   **NativePHP Jump:** Aplicativo *companion* oficial para Android e iOS.
*   **Fluxo de Teste:** O comando `php artisan native:jump` compila o bundle, envia para um servidor de cache (Bifrost) e gera um QR Code.
*   **Dispositivo Físico:** Escaneie o QR Code com o app Jump no celular para executar a aplicação imediatamente, testando integrações de câmera e rede em hardware real sem necessitar de cabos ou modo desenvolvedor.
*   **Hot Reloading:** Atualizações nas *views* (Blade, Livewire, React) são refletidas em tempo real no dispositivo físico usando o servidor Vite injetado.
```