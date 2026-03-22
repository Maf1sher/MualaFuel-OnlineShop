# Scenariusze Testowe Manualne: MualaFuel-OnlineShop

Dokument zawiera 15 kluczowych scenariuszy testowych opracowanych na podstawie `TEST_PLAN.md`. Scenariusze te stanowią podstawę do automatyzacji w Playwright.

## Moduł 1: Autoryzacja i Dostęp (Auth)

### 1. Rejestracja nowego użytkownika (Happy Path)
*   **ID:** TC-AUTH-01
*   **Warunki wstępne:** Brak konta przypisanego do testowego adresu e-mail.
*   **Kroki:**
    1. Przejdź do strony `/registration`.
    2. Wypełnij pola: Username, Email, Password.
    3. Kliknij przycisk "Zarejestruj".
*   **Oczekiwany rezultat:** Wyświetlenie komunikatu o sukcesie, automatyczne przekierowanie do strony logowania (`/login`).

### 2. Logowanie użytkownika (Role: USER)
*   **ID:** TC-AUTH-02
*   **Warunki wstępne:** Istniejące konto z rolą USER.
*   **Kroki:**
    1. Przejdź do strony `/login`.
    2. Wprowadź poprawny e-mail i hasło.
    3. Kliknij "Zaloguj".
*   **Oczekiwany rezultat:** Przekierowanie na stronę główną, widoczny przycisk "Wyloguj" w Navbarze, dostęp do zakładki "Zamówienia".

### 3. Logowanie administratora i dostęp do panelu (Role: ADMIN)
*   **ID:** TC-AUTH-03
*   **Warunki wstępne:** Istniejące konto z rolą ADMIN.
*   **Kroki:**
    1. Zaloguj się na konto administratora.
    2. Przejdź pod adres `/orders-management`.
*   **Oczekiwany rezultat:** Strona ładuje się poprawnie, widoczna lista zamówień wszystkich użytkowników systemu.

### 4. Nieudane logowanie (Negative Path)
*   **ID:** TC-AUTH-04
*   **Kroki:**
    1. Przejdź do strony `/login`.
    2. Wprowadź poprawny e-mail, ale błędne hasło.
    3. Kliknij "Zaloguj".
*   **Oczekiwany rezultat:** Wyświetlenie czytelnego komunikatu o błędzie (np. "Invalid credentials"), użytkownik pozostaje na stronie logowania.

### 5. Zabezpieczenie tras (Protected Routes)
*   **ID:** TC-AUTH-05
*   **Warunki wstępne:** Użytkownik nie jest zalogowany.
*   **Kroki:**
    1. Spróbuj wejść bezpośrednio na adres `/orders`.
    2. Spróbuj wejść bezpośrednio na adres `/orders-management`.
*   **Oczekiwany rezultat:** System blokuje dostęp i automatycznie przekierowuje użytkownika do strony logowania (`/login`).

---

## Moduł 2: Produkty i Asortyment (Assortment)

### 6. Przeglądanie i wyszukiwanie produktów
*   **ID:** TC-PROD-01
*   **Kroki:**
    1. Wejdź na stronę `/assortment`.
    2. Wpisz nazwę istniejącego produktu w pole wyszukiwarki.
*   **Oczekiwany rezultat:** Lista produktów jest filtrowana w czasie rzeczywistym, wyświetlane są tylko pasujące pozycje.

### 7. Szczegóły produktu
*   **ID:** TC-PROD-02
*   **Kroki:**
    1. Na liście produktów kliknij w kartę wybranego produktu.
*   **Oczekiwany rezultat:** Przejście do widoku `/product/:id`, widoczne pełne dane: nazwa, opis, cena oraz zdjęcie produktu.

### 8. Dodanie nowego produktu (Admin Only)
*   **ID:** TC-PROD-03
*   **Warunki wstępne:** Zalogowany jako ADMIN.
*   **Kroki:**
    1. Przejdź do formularza dodawania produktu.
    2. Wypełnij dane (nazwa, cena, opis) i załącz zdjęcie.
    3. Kliknij "Zapisz".
*   **Oczekiwany rezultat:** Produkt zostaje dodany do bazy i pojawia się na liście w zakładce `/assortment`.

### 9. Edycja produktu (Admin Only)
*   **ID:** TC-PROD-04
*   **Warunki wstępne:** Zalogowany jako ADMIN.
*   **Kroki:**
    1. Wybierz produkt z listy, kliknij "Edytuj".
    2. Zmień cenę produktu i zapisz zmiany.
*   **Oczekiwany rezultat:** Zmiany zostają zapisane; po wejściu w szczegóły produktu widoczna jest nowa cena.

---

## Moduł 3: Koszyk i Zamówienia (Cart & Orders)

### 10. Dodawanie produktu do koszyka
*   **ID:** TC-CART-01
*   **Kroki:**
    1. Na stronie produktu kliknij przycisk "Dodaj do koszyka".
*   **Oczekiwany rezultat:** Badge przy ikonie koszyka w menu nawigacyjnym zwiększa swoją wartość o 1.

### 11. Zarządzanie zawartością koszyka
*   **ID:** TC-CART-02
*   **Kroki:**
    1. Przejdź do widoku `/cart`.
    2. Zmień ilość sztuk produktu przyciskiem (+).
    3. Usuń jeden z produktów przyciskiem "Usuń".
*   **Oczekiwany rezultat:** Łączna kwota zamówienia aktualizuje się poprawnie, usunięty produkt znika z listy.

### 12. Proces składania zamówienia (Checkout)
*   **ID:** TC-ORDER-01
*   **Warunki wstępne:** Zalogowany użytkownik, co najmniej jeden produkt w koszyku.
*   **Kroki:**
    1. W widoku koszyka kliknij "Złóż zamówienie".
    2. Potwierdź podsumowanie zamówienia.
*   **Oczekiwany rezultat:** Przekierowanie do strony potwierdzenia/historii zamówień, koszyk zostaje opróżniony.

### 13. Weryfikacja historii zamówień użytkownika
*   **ID:** TC-ORDER-02
*   **Warunki wstępne:** Użytkownik złożył wcześniej przynajmniej jedno zamówienie.
*   **Kroki:**
    1. Przejdź do zakładki `/orders`.
*   **Oczekiwany rezultat:** Na liście wyświetlane są poprawne dane zamówienia: numer, data, status oraz łączna kwota.

---

## Moduł 4: Administracja i Audyt (Admin Ops)

### 14. Zarządzanie statusem zamówienia (Admin)
*   **ID:** TC-ADMIN-01
*   **Warunki wstępne:** Zalogowany jako ADMIN, istnieje zamówienie ze statusem `PENDING`.
*   **Kroki:**
    1. W panelu `/orders-management` znajdź zamówienie.
    2. Zmień status na `SHIPPED`.
*   **Oczekiwany rezultat:** Nowy status zostaje zapisany; użytkownik po odświeżeniu swojej historii widzi zmianę statusu.

### 15. Historia e-maili i audyt (Admin)
*   **ID:** TC-ADMIN-02
*   **Warunki wstępne:** Wykonano akcję generującą e-mail (np. złożenie zamówienia).
*   **Kroki:**
    1. Jako ADMIN wejdź do zakładki `/email-history`.
*   **Oczekiwany rezultat:** Na liście widoczny jest wpis potwierdzający wysyłkę e-maila do konkretnego adresata z odpowiednim tematem (np. Order Confirmation).
