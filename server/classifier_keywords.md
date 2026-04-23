# Transaction Classifier Keywords

This document outlines the keywords used by the fallback classifier when the Gemini AI is unavailable or fails to parse a transaction.

## Categories & Keywords

| Category | Keywords |
| :--- | :--- |
| **Food** | swiggy, zomato, food, restaurant, grocery, mart, biscuit, cake, chai, coffee |
| **Transport** | uber, ola, petrol, cab, rickshaw, auto, train, ticket, flight, bus |
| **Shopping** | amazon, flipkart, shopping, clothes, myntra, shoes, bag |
| **Utilities** | bill, electricity, water, wifi, recharge, jio, airtel, mobile |
| **Entertainment** | movie, netflix, spotify, party, club, game, steam |
| **Income Type** | salary, earned, received, credited, income |

## Recognition Patterns

- **Amounts**: Recognizes numbers and 'k' suffix (e.g., "5k" -> 5000).
- **Default Category**: Falls back to `other` if no keywords match.
- **Default Type**: Falls back to `expense` unless income keywords are present.

> [!TIP]
> You can add more keywords to `server/src/ai/parseTransaction.ts` to improve recognition for specific merchants or services.
