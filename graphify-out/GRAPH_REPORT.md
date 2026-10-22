# Graph Report - Aplicativo_1  (2026-10-22)

## Corpus Check
- Corpus is ~26,629 words - fits in a single context window. You may not need a graph.

## Summary
- 192 nodes · 416 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.84)
- Token cost: 112,068 input · 0 output

## Community Hubs (Navigation)
- Componentes de UI
- Navegação e Login
- Testes Cypress
- Config Expo (app.json)
- Crítica de Design
- Autenticação
- Catálogo e Home
- Dependências
- Ações do Carrinho
- Ícones padrão Expo
- Config TypeScript
- Tipos de imagem
- Splash Icon

## God Nodes (most connected - your core abstractions)
1. `react-native` - 17 edges
2. `PressableScale()` - 17 edges
3. `react` - 15 edges
4. `FadeInView()` - 14 edges
5. `colors` - 11 edges
6. `expo` - 10 edges
7. `Home()` - 10 edges
8. `useAuth()` - 9 edges
9. `useCart()` - 9 edges
10. `Cart()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Automated Anti-pattern Detector` --conceptually_related_to--> `Cypress Component Test Index HTML`  [AMBIGUOUS]
  .impeccable/critique/2026-10-06T20-59-31Z__src-pages.md → cypress/support/component-index.html
- `App()` --calls--> `AuthProvider()`  [EXTRACTED]
  App.tsx → src/context/AuthContext.tsx
- `App()` --calls--> `CartProvider()`  [EXTRACTED]
  App.tsx → src/context/CartContext.tsx
- `Routes()` --calls--> `useAuth()`  [EXTRACTED]
  App.tsx → src/context/AuthContext.tsx
- `App Icon (Expo chevron on blueprint)` --semantically_similar_to--> `Android Adaptive Icon Background (Expo default blueprint grid)`  [INFERRED] [semantically similar]
  assets/icon.png → assets/android-icon-background.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **User persona stress tests (Casey, Riley, Jordan)** — _impeccable_critique_2026_10_06t20_59_31z__src_pages_persona_casey, _impeccable_critique_2026_10_06t20_59_31z__src_pages_persona_riley, _impeccable_critique_2026_10_06t20_59_31z__src_pages_persona_jordan [EXTRACTED 1.00]
- **Prioritized design issues (P0-P2)** — _impeccable_critique_2026_10_06t20_59_31z__src_pages_missing_checkout, _impeccable_critique_2026_10_06t20_59_31z__src_pages_insufficient_contrast, _impeccable_critique_2026_10_06t20_59_31z__src_pages_touch_targets_screen_reader, _impeccable_critique_2026_10_06t20_59_31z__src_pages_keyboard_and_search, _impeccable_critique_2026_10_06t20_59_31z__src_pages_unusable_coupon [EXTRACTED 1.00]
- **Android Adaptive Icon Layer Set** — assets_android_icon_background, assets_android_icon_foreground, assets_android_icon_monochrome [INFERRED 0.95]

## Communities (13 total, 2 thin omitted)

### Community 0 - "Componentes de UI"
Cohesion: 0.15
Nodes (30): Persona: Riley (edge-case tester), react, react-native, react-native-safe-area-context, CartButton(), styles, FadeInView(), Props (+22 more)

### Community 1 - "Navegação e Login"
Cohesion: 0.13
Nodes (23): [P1] Keyboard Covers Login Button & Search Issues, Password Strength Meter (4 bars / 5 levels), App(), Routes(), Stack, @react-navigation/native-stack, App Logo (purple rounded square with white checkmark), TextField (+15 more)

### Community 2 - "Testes Cypress"
Cohesion: 0.08
Nodes (22): Chainable, Cypress, devDependencies, cypress, @types/react, typescript, main, name (+14 more)

### Community 3 - "Config Expo (app.json)"
Cohesion: 0.11
Nodes (18): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+10 more)

### Community 4 - "Crítica de Design"
Cohesion: 0.15
Nodes (14): Design Critique: Patinhas app (src/pages), Automated Anti-pattern Detector, Avatar Used as Logout Button, [P1] Insufficient Color Contrast, [P0] Missing Checkout Flow, Patinhas Petshop App, Persona: Casey (one-handed, distracted), Persona: Jordan (first-time user) (+6 more)

### Community 5 - "Autenticação"
Cohesion: 0.22
Nodes (13): expo-crypto, @react-native-async-storage/async-storage, AuthContext, AuthContextData, AuthProvider(), signIn(), signUp(), hashPassword() (+5 more)

### Community 6 - "Catálogo e Home"
Cohesion: 0.30
Nodes (8): CartContext, CartContextData, categories, products, styles, CartItem, Category, Product

### Community 7 - "Dependências"
Cohesion: 0.18
Nodes (11): dependencies, expo, expo-crypto, expo-status-bar, react, react-native, @react-native-async-storage/async-storage, react-native-safe-area-context (+3 more)

### Community 8 - "Ações do Carrinho"
Cohesion: 0.24
Nodes (10): signOut(), CartProvider(), addToCart(), changeQuantity(), clearCart(), removeFromCart(), Cart(), checkout() (+2 more)

### Community 9 - "Ícones padrão Expo"
Cohesion: 0.33
Nodes (6): Android Adaptive Icon Background (Expo default blueprint grid), Android Adaptive Icon Foreground (Expo chevron), Android Monochrome Icon (gray Expo chevron), Expo Default Template Brand Mark, Web Favicon (small Expo chevron), App Icon (Expo chevron on blueprint)

### Community 10 - "Config TypeScript"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

## Ambiguous Edges - Review These
- `Login/index.tsx` → `Password Strength Meter (4 bars / 5 levels)`  [AMBIGUOUS]
  .impeccable/critique/2026-10-06T20-59-31Z__src-pages.md · relation: conceptually_related_to
- `Automated Anti-pattern Detector` → `Cypress Component Test Index HTML`  [AMBIGUOUS]
  .impeccable/critique/2026-10-06T20-59-31Z__src-pages.md · relation: conceptually_related_to

## Knowledge Gaps
- **17 isolated node(s):** `react-native-screens`, `@types/react`, `typescript`, `expo/tsconfig.base`, `[P1] Keyboard Covers Login Button & Search Issues` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 86 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Componentes de UI` to `Navegação e Login`, `Testes Cypress`, `Autenticação`, `Catálogo e Home`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **What connects `react-native-screens`, `@types/react`, `typescript` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Componentes de UI` be split into smaller, more focused modules?**
  _Cohesion score 0.14512195121951219 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `Componentes de UI` to `Navegação e Login`, `Testes Cypress`, `Catálogo e Home`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `Navegação e Login` be split into smaller, more focused modules?**
  _Cohesion score 0.13054187192118227 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Login/index.tsx` and `Password Strength Meter (4 bars / 5 levels)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Automated Anti-pattern Detector` and `Cypress Component Test Index HTML`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._