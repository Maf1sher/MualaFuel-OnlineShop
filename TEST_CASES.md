# Przypadki Testowe

## 1. Rejestracja i Autentykacja (AuthService) ~ Jakub Laskowski

| ID | Warunek wejścia | Input | Rezultat | Warunek wyjścia | ID wymagania | Lokalizacja (Plik:Linia) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC1** | Baza pusta | createUser(validRegisterRequest) | true | User zapisany w DB | R1.1 | `AuthServiceTest.java:58` |
| **TC2** | Dane poprawne | password.length >= 8 | true | Walidacja pomyślna | R1.2 | `AuthServiceTest.java:73` |
| **TC3** | Hasło za krótkie | password.length = 5 | false | MethodArgumentNotValidException | R1.2 | `AuthServiceTest.java:81` |
| **TC4** | Email już istnieje | createUser(existingEmail) | false | DuplicateEmailException | R1.3 | `AuthServiceTest.java:89` |
| **TC5** | Nowy użytkownik | roleRepository.findByName("USER") | true | Rola USER przypisana | R1.4 | `AuthServiceTest.java:99` |
| **TC6** | Rejestracja | passwordEncoder.encode() | true | Hasło w DB jest zahashowane | R1.5 | `AuthServiceTest.java:111` |
| **TC7** | Logowanie | authenticate(validEmail, validPass) | true | Obiekt Authentication != null | R1.6 | `AuthServiceTest.java:123` |
| **TC8** | Logowanie | authenticate(validEmail, wrongPass) | false | BadCredentialsException | R1.6 | `AuthServiceTest.java:136` |
| **TC9** | Generowanie JWT | jwtService.generateToken(userDetails) | true | String token != null | R1.7 | `AuthServiceTest.java:145` |
| **TC10** | Walidacja JWT | jwtService.isTokenValid(validToken) | true | boolean true | R1.7 | `AuthServiceTest.java:152` |
| **TC11** | Walidacja JWT | jwtService.isTokenValid(expiredToken) | false | boolean false | R1.7 | `AuthServiceTest.java:158` |
| **TC12** | Sprawdzenie autoryzacji | SecurityContextHolder.getContext() | true | IsAuthenticated() == true | R1.10 | `AuthServiceTest.java:164` |
| **TC13** | RegisterRequest | firstName = null | false | ConstraintViolationException | R1.1 | `AuthServiceTest.java:175` |
| **TC14** | Format emaila | validateEmail("test@wp.pl") | true | Dopasowanie do Regex | R1.1 | `AuthServiceTest.java:183` |
| **TC15** | Format emaila | validateEmail("invalid-email") | false | Brak dopasowania do Regex | R1.1 | `AuthServiceTest.java:191` |
| **TC16** | Przypisanie roli | user.getRoles().contains("ADMIN") | false | Domyślnie tylko USER | R1.4 | `AuthServiceTest.java:199` |
| **TC17** | Hash hasła | bCrypt.matches(raw, hashed) | true | boolean true | R1.5 | `AuthServiceTest.java:206` |
| **TC18** | Mapowanie użytkownika | mapper.toEntity(dto) | true | Pola encji == pola DTO | R1.1 | `AuthServiceTest.java:212` |
| **TC19** | Wylogowanie | tokenStorage.invalidate(token) | true | Token na czarnej liście | R1.9 | `AuthServiceTest.java:222` |
| **TC20** | Kontrola dostępu | hasRole("USER").canAccess("/api/orders") | true | Dostęp przyznany | R1.8 | `AuthServiceTest.java:230` |

---

## 2. Katalog Produktów (ProductService) ~ Mateusz Lengiewicz

| ID | Warunek wejścia | Input | Rezultat | Warunek wyjścia | ID wymagania | Lokalizacja (Plik:Linia) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC21** | Lista produktów | productRepo.findAll(pageable) | true | Page<Product> != null | R2.1 | `ProductServiceTest.java:53` |
| **TC22** | Rola ADMIN | saveProduct(validProductDto) | true | Produkt zapisany | R2.2 | `ProductServiceTest.java:63` |
| **TC23** | Rola USER | saveProduct(validProductDto) | false | AccessDeniedException | R2.2 | `ProductServiceTest.java:75` |
| **TC24** | Cena produktu | price = 10.50 | true | Walidacja OK | R2.4 | `ProductServiceTest.java:83` |
| **TC25** | Cena produktu | price = -5.00 | false | ConstraintViolationException | R2.4 | `ProductServiceTest.java:91` |
| **TC26** | Edycja produktu | updateProduct(id, newDto) | true | Pola zaktualizowane w bazie danych | R2.5 | `ProductServiceTest.java:99` |
| **TC27** | Usuwanie | deleteProduct(existingId) | true | productRepo.existsById == false | R2.6 | `ProductServiceTest.java:112` |
| **TC28** | Wyszukiwanie | findByNameContaining("Wódka") | true | Rozmiar listy > 0 | R2.7 | `ProductServiceTest.java:118` |
| **TC29** | Filtrowanie | findByType(AlcoholType.BEER) | true | Wszystkie wyniki to BEER | R2.8 | `ProductServiceTest.java:129` |
| **TC30** | Filtr ceny | findByPriceBetween(10, 50) | true | Wszystkie ceny w zakresie | R2.9 | `ProductServiceTest.java:141` |
| **TC31** | Paginacja | findAll(PageRequest.of(0, 10)) | true | Rozmiar wyniku <= 10 | R2.10 | `ProductServiceTest.java:151` |
| **TC32** | Mapowanie DTO | mapper.toDto(productEntity) | true | Nazwa DTO == nazwa encji | R2.3 | `ProductServiceTest.java:161` |
| **TC33** | Walidacja | productDto.name = "" | false | Błąd walidacji | R2.3 | `ProductServiceTest.java:171` |
| **TC34** | Stan magazynowy | stock = 0 | true | Produkt "Brak w magazynie" | R2.3 | `ProductServiceTest.java:178` |
| **TC35** | Stan magazynowy | stock = -1 | false | Błąd walidacji | R2.3 | `ProductServiceTest.java:184` |
| **TC36** | Pobranie po ID | findById(nonExistingId) | false | ProductNotFoundException | R2.1 | `ProductServiceTest.java:192` |
| **TC37** | Aktualizacja | updateStock(id, -10) | true | Zmniejszony stan magazynowy | R2.5 | `ProductServiceTest.java:198` |
| **TC38** | Wyszukiwanie | findByName("NotExists") | true | Pusta lista (brak błędu) | R2.7 | `ProductServiceTest.java:205` |
| **TC39** | URL obrazu | product.setImageUrl(path) | true | Ścieżka zapisana | R2.3 | `ProductServiceTest.java:215` |
| **TC40** | Usuwanie masowe | deleteAll(ids) | true | Repozytorium puste | R2.6 | `ProductServiceTest.java:222` |

---

## 3. Koszyk Zakupowy (CartService) ~ Gabriel Charkiewicz

| ID | Warunek wejścia | Input | Rezultat | Warunek wyjścia | ID wymagania | Lokalizacja (Plik:Linia) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC41** | Pusty koszyk | addItem(user, product, 1) | true | Dodano CartItem | R3.1 | `CartServiceTest.java:51` |
| **TC42** | Magazyn = 5 | addItem(user, product, 6) | false | InsufficientStockException | R3.2 | `CartServiceTest.java:58` |
| **TC43** | Koszyk (10+20) | calculateTotal(cart) | true | Wynik == 30.00 | R3.3 | `CartServiceTest.java:66` |
| **TC44** | Produkt w koszyku | updateQuantity(itemId, 5) | true | Ilość = 5 | R3.4 | `CartServiceTest.java:74` |
| **TC45** | Produkt w koszyku | removeItem(itemId) | true | CartItem usunięty | R3.5 | `CartServiceTest.java:81` |
| **TC46** | Pełny koszyk | clearCart(userId) | true | Koszyk pusty | R3.6 | `CartServiceTest.java:88` |
| **TC47** | Nowa sesja | getCartByUser(userId) | true | Dane pobrane z bazy danych | R3.7 | `CartServiceTest.java:95` |
| **TC48** | Produkt już jest | addItem(productA, 1) -> addItem(productA, 1) | true | Ilość = 2 (1 wiersz) | R3.8 | `CartServiceTest.java:101` |
| **TC49** | Produkt niedostępny | checkAvailability(cart) | false | Zwraca listę nieprawidłowych produktów | R3.9 | `CartServiceTest.java:110` |
| **TC50** | Liczba elementów | cart.getTotalItems() | true | liczba == suma ilości | R3.10 | `CartServiceTest.java:116` |
| **TC51** | Cena 0 | product.setPrice(0) | false | IllegalStateException | R3.3 | `CartServiceTest.java:125` |
| **TC52** | Mapowanie CartItem | mapper.toCartDto(cart) | true | DTO zainicjalizowane | R3.1 | `CartServiceTest.java:134` |
| **TC53** | Aktualizacja ilości | updateQuantity(id, 0) | true | Przedmiot usunięty z koszyka | R3.4 | `CartServiceTest.java:141` |
| **TC54** | Max przedmiotów | addItem(quantity = 999) | false | MaxQuantityExceeded | R3.2 | `CartServiceTest.java:149` |
| **TC55** | Sprawdzenie użytkownika | getCart(differentUserId) | false | AccessDeniedException | R3.7 | `CartServiceTest.java:157` |
| **TC56** | Synchronizacja stanów | refreshCartPrices(cart) | true | Ceny zgadzają się z bazą danych | R3.3 | `CartServiceTest.java:164` |
| **TC57** | Dodawanie współbieżne | 2 wątki dodające ten sam produkt | true | Poprawna suma (Atomowość/Blokada) | R3.8 | `CartServiceTest.java:170` |
| **TC58** | Pusty koszyk | calculateTotal() | true | Wynik == 0 | R3.3 | `CartServiceTest.java:179` |
| **TC59** | Produkt null | addItem(null) | false | IllegalArgumentException | R3.1 | `CartServiceTest.java:185` |
| **TC60** | Trwałość koszyka | save(cart) | true | cartId != null | R3.7 | `CartServiceTest.java:193` |

---

## 4. Składanie Zamówienia (OrderService) ~ Mateusz Strapczuk

| ID | Warunek wejścia | Input | Rezultat | Warunek wyjścia | ID wymagania | Lokalizacja (Plik:Linia) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC61** | User zalogowany | checkout(userId) | true | Rozpoczęcie procesu zamówienia | R4.1 | `OrderServiceTest.java:59` |
| **TC62** | Koszyk pusty | createOrder(emptyCart) | false | EmptyCartException | R4.2 | `OrderServiceTest.java:73` |
| **TC63** | Adres wysyłki | address.setZipCode("00-111") | true | Walidacja OK | R4.4 | `OrderServiceTest.java:80` |
| **TC64** | Adres wysyłki | address.setZipCode("ABC") | false | ConstraintViolationException | R4.4 | `OrderServiceTest.java:86` |
| **TC65** | Płatność | setPaymentMethod(CARD) | true | Metoda ustawiona | R4.5 | `OrderServiceTest.java:92` |
| **TC66** | Tworzenie | orderRepo.save(order) | true | id != null, status=PENDING | R4.7, R4.10 | `OrderServiceTest.java:98` |
| **TC67** | Magazyn | product.reduceStock(orderedQty) | true | Nowy stan = stary - ilość | R4.6 | `OrderServiceTest.java:107` |
| **TC68** | Czyszczenie | cartService.clear(userId) | true | Koszyk pusty po zamówieniu | R4.9 | `OrderServiceTest.java:114` |
| **TC69** | Email | emailService.sendConfirmation(order) | true | Wyzwalacz wysłania emaila | R4.8 | `OrderServiceTest.java:127` |
| **TC70** | Status | order.getStatus() | true | Równy OrderStatus.PENDING | R4.10 | `OrderServiceTest.java:140` |
| **TC71** | Użytkownik gość | createOrder(nullUser) | false | UnauthorizedException | R4.1 | `OrderServiceTest.java:146` |
| **TC72** | Walidacja | orderRequest.city = null | false | Błąd walidacji | R4.3 | `OrderServiceTest.java:151` |
| **TC73** | Suma | order.getTotalPrice() | true | Suma produktów + wysyłka | R4.2 | `OrderServiceTest.java:157` |
| **TC74** | Generowanie ID | sequenceGenerator.next() | true | Zwrócono unikalne ID | R4.7 | `OrderServiceTest.java:163` |
| **TC75** | Element zamówienia | createOrderItem(product, qty) | true | Cena utrwalona w momencie zakupu | R4.6 | `OrderServiceTest.java:170` |
| **TC76** | Historia | auditService.logOrder(order) | true | Utworzono rekord audytu | R4.7 | `OrderServiceTest.java:177` |
| **TC77** | Transakcyjność | rollbackOnException() | true | Stan bazy danych bez zmian v razie błędu | R4.6 | `OrderServiceTest.java:183` |
| **TC78** | Sprawdzenie magazynu | isStockAvailable(order) | true | true | R4.6 | `OrderServiceTest.java:188` |
| **TC79** | Mapowanie | orderMapper.toDto(order) | true | Zmapowano do DTO | R4.7 | `OrderServiceTest.java:194` |
| **TC80** | Mapowanie adresu | shippingMapper.toEntity(dto) | true | Zmapowano do encji | R4.3 | `OrderServiceTest.java:202` |

---

## 5. Administracja (OrderAdminService) ~ Szymon Bartkowiak

| ID | Warunek wejścia | Input | Rezultat | Warunek wyjścia | ID wymagania | Lokalizacja (Plik:Linia) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC81** | Rola ADMIN | orderAdminRepo.findAll() | true | Zwrócono List<Order> | R5.1 | `OrderAdminServiceTest.java:54` |
| **TC82** | Filtrowanie | findByStatus(SHIPPED) | true | Wszystkie zamówienia mają status SHIPPED | R5.2 | `OrderAdminServiceTest.java:60` |
| **TC83** | Wyszukiwanie | findById(123L) | true | Zwrócono poprawne zamówienie | R5.3 | `OrderAdminServiceTest.java:67` |
| **TC84** | Zmiana statusu | updateStatus(id, SHIPPED) | true | Status zmieniony w bazie danych | R5.4 | `OrderAdminServiceTest.java:75` |
| **TC85** | Anulowanie | updateStatus(id, CANCELED) | true | Stan magazynowy przywrócony w ProductRepo | R5.5 | `OrderAdminServiceTest.java:83` |
| **TC86** | Audyt | auditRepo.findByOrderId(id) | true | Lista zmian > 0 | R5.6 | `OrderAdminServiceTest.java:91` |
| **TC87** | Szczegóły | getOrderDetails(id) | true | Zawiera produkty, wysyłkę, płatność | R5.7 | `OrderAdminServiceTest.java:97` |
| **TC88** | Filtr daty | findByDateBetween(d1, d2) | true | Zamówienia w zakresie | R5.8 | `OrderAdminServiceTest.java:103` |
| **TC89** | Rola USER | adminService.getAllOrders() | false | AccessDeniedException | R5.9 | `OrderAdminServiceTest.java:109` |
| **TC90** | Historia email | emailHistoryRepo.findByOrder(id) | true | Zwrócono listę emaili | R5.10 | `OrderAdminServiceTest.java:116` |
| **TC91** | Poprawne przejście | PENDING -> SHIPPED | true | Dozwolone | R5.4 | `OrderAdminServiceTest.java:122` |
| **TC92** | Niepoprawne przejście | DELIVERED -> PENDING | false | IllegalStatusTransitionException | R5.4 | `OrderAdminServiceTest.java:129` |
| **TC93** | Przywrócenie stanu | product.addStock(canceledQty) | true | Stan magazynowy zwiększony | R5.5 | `OrderAdminServiceTest.java:137` |
| **TC94** | Szczegóły użytkownika | order.getUser().getEmail() | true | Email pobrany | R5.7 | `OrderAdminServiceTest.java:144` |
| **TC95** | Wyszukiwanie zamówień | searchByCustomerEmail("test@wp.pl") | true | Lista zamówień użytkownika | R5.1 | `OrderAdminServiceTest.java:151` |
| **TC96** | Role administratora | security.hasAnyRole("ADMIN") | true | Dostęp przyznany | R5.9 | `OrderAdminServiceTest.java:160` |
| **TC97** | Masowa aktualizacja | updateStatuses(ids, SHIPPED) | true | Wszystkie zaktualizowane | R5.4 | `OrderAdminServiceTest.java:165` |
| **TC98** | Log emaila | logEmail(orderId, template) | true | Utworzono wpis w logu | R5.10 | `OrderAdminServiceTest.java:175` |
| **TC99** | Statystyki zamówień | getOrderStats() | true | Mapa z liczbą zamówień na status | R5.2 | `OrderAdminServiceTest.java:181` |
| **TC100** | Pusta historia | getEmailHistory(newOrder) | true | Pusta lista (brak błędu) | R5.10 | `OrderAdminServiceTest.java:186` |
