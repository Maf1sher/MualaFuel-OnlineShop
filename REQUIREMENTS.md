# Wymagania Funkcjonalne - MualaFuel OnlineShop

Ten dokument zawiera szczegółowe wymagania funkcjonalne dla 5 kluczowych modułów systemu, które posłużą jako podstawa do opracowania scenariuszy testowych.

---

## 1. Rejestracja i Autentykacja Użytkownika
| ID | Wymaganie (Requirement) |
| :--- | :--- |
| **R1.1** | System umożliwia utworzenie nowego konta użytkownika po podaniu imienia, nazwiska, unikalnego adresu e-mail i hasła. |
| **R1.2** | Hasło użytkownika musi składać się z co najmniej 8 znaków. |
| **R1.3** | System blokuje rejestrację, jeśli podany adres e-mail istnieje już w bazie danych. |
| **R1.4** | Każdy nowo zarejestrowany użytkownik automatycznie otrzymuje rolę `USER`. |
| **R1.5** | Hasła muszą być przechowywane w bazie danych w formie zaszyfrowanej (BCrypt). |
| **R1.6** | Logowanie wymaga podania poprawnego adresu e-mail oraz hasła. |
| **R1.7** | Po poprawnym zalogowaniu system generuje i przesyła token JWT w bezpiecznym ciasteczku (HttpOnly). |
| **R1.8** | System blokuje dostęp do chronionych endpointów (np. `/api/orders`) dla użytkowników bez ważnego tokena. |
| **R1.9** | Funkcja wylogowania usuwa/unieważnia token sesji po stronie klienta. |
| **R1.10** | System umożliwia weryfikację statusu zalogowania (endpoint `/check`). |

---

## 2. Zarządzanie Katalogiem Produktów
| ID | Wymaganie (Requirement) |
| :--- | :--- |
| **R2.1** | System umożliwia przeglądanie pełnej listy dostępnych produktów wszystkim użytkownikom. |
| **R2.2** | Tylko użytkownik z rolą `ADMIN` ma uprawnienia do dodawania nowego produktu. |
| **R2.3** | Każdy produkt musi posiadać nazwę, opis, cenę jednostkową, typ alkoholu oraz stan magazynowy. |
| **R2.4** | Cena produktu musi być wartością liczbową większą od zera. |
| **R2.5** | Administrator może edytować dane istniejącego produktu (np. zmienić cenę lub opis). |
| **R2.6** | Administrator może usunąć produkt z katalogu (usuwanie logiczne lub fizyczne). |
| **R2.7** | System umożliwia wyszukiwanie produktów po nazwie (częściowe dopasowanie). |
| **R2.8** | System umożliwia filtrowanie produktów według typu alkoholu (np. Wódka, Wino, Piwo). |
| **R2.9** | System umożliwia filtrowanie produktów według zakresu cenowego (od-do). |
| **R2.10** | Lista produktów musi być stronicowana (paginacja), aby optymalizować czas ładowania. |

---

## 3. Koszyk Zakupowy
| ID | Wymaganie (Requirement) |
| :--- | :--- |
| **R3.1** | Zalogowany użytkownik może dodać wybrany produkt do swojego koszyka. |
| **R3.2** | System uniemożliwia dodanie do koszyka większej liczby sztuk niż jest dostępna w magazynie. |
| **R3.3** | Koszyk musi automatycznie przeliczać łączną wartość brutto wszystkich dodanych przedmiotów. |
| **R3.4** | Użytkownik może zwiększyć lub zmniejszyć ilość sztuk danego produktu bezpośrednio w koszyku. |
| **R3.5** | Użytkownik może usunąć wybrany produkt z koszyka. |
| **R3.6** | System umożliwia całkowite wyczyszczenie koszyka jednym działaniem. |
| **R3.7** | Zawartość koszyka musi być trwała (powiązana z kontem użytkownika w bazie danych). |
| **R3.8** | Przy dodawaniu tego samego produktu wielokrotnie, system powinien zwiększać ilość (Quantity) zamiast tworzyć nową pozycję. |
| **R3.9** | Jeśli stan magazynowy produktu spadnie do zera, system powinien oznaczyć go w koszyku jako "niedostępny". |
| **R3.10** | Koszyk musi być dostępny do wglądu z poziomu nawigacji strony głównej. |

---

## 4. Składanie Zamówienia (Checkout)
| ID | Wymaganie (Requirement) |
| :--- | :--- |
| **R4.1** | Użytkownik musi być zalogowany, aby móc złożyć zamówienie. |
| **R4.2** | Proces składania zamówienia jest możliwy tylko wtedy, gdy koszyk nie jest pusty. |
| **R4.3** | Formularz zamówienia wymaga podania danych adresowych (ulica, miasto, kod pocztowy). |
| **R4.4** | Kod pocztowy musi być walidowany pod kątem poprawnego formatu (np. 00-000). |
| **R4.5** | Użytkownik musi wybrać metodę płatności spośród dostępnych opcji. |
| **R4.6** | Po zatwierdzeniu zamówienia system musi odjąć zakupioną ilość produktów ze stanu magazynowego. |
| **R4.7** | Każde zamówienie otrzymuje unikalny numer identyfikacyjny. |
| **R4.8** | System automatycznie wysyła e-mail z potwierdzeniem zamówienia na adres użytkownika. |
| **R4.9** | Po złożeniu zamówienia koszyk użytkownika jest automatycznie czyszczony. |
| **R4.10** | Zamówienie po utworzeniu otrzymuje domyślny status `PENDING` (Oczekujące). |

---

## 5. Administracja Zamówieniami
| ID | Wymaganie (Requirement) |
| :--- | :--- |
| **R5.1** | Administrator ma dostęp do listy wszystkich zamówień złożonych w systemie. |
| **R5.2** | System umożliwia filtrowanie zamówień według statusu (np. SHIPPED, DELIVERED, CANCELED). |
| **R5.3** | Administrator może wyszukać zamówienie po jego unikalnym numerze ID. |
| **R5.4** | Administrator może zmienić status zamówienia (np. z `PENDING` na `SHIPPED`). |
| **R5.5** | Zmiana statusu na `CANCELED` powinna skutkować przywróceniem produktów do stanu magazynowego. |
| **R5.6** | Każda zmiana statusu zamówienia musi być zapisywana w historii (audyt). |
| **R5.7** | Administrator ma wgląd w szczegóły zamówienia (dane klienta, pełna lista produktów, suma). |
| **R5.8** | System umożliwia filtrowanie zamówień po dacie ich złożenia. |
| **R5.9** | Tylko użytkownicy z rolą `ADMIN` mają dostęp do endpointów zarządzania zamówieniami. |
| **R5.10** | System umożliwia podgląd historii wysłanych wiadomości e-mail powiązanych z zamówieniem. |
