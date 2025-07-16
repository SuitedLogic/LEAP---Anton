## Getting Started

First, run the development server:

```bash
npm i
```

### Host records
```
127.0.0.1    www.mayhem.local
127.0.0.1    api.mayhem.local
```

### Running 

```bash
npm run dev
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Challenges

### 1: Content Creator

#### 1.1: "Lego Building"

Problem: Our HTML implementation of CMS modules needs to be interactive and re-usable.
Implementation: Create react components to cover our existing HTML structure.
Goal: Reusable react components.

#### 1.2: "Who's Jason"

Problem: Our page data is JSON driven, we want to be able to update the JSON configuration to drive our CMS pages.
Implementation: 
    - Convert the static HTML page to be driven from our JSON configuration. 
    - React components should be used in conjunction with the JSON data.
    - Components should have property types defined.
Goal: A dynamically driven page with react components matching the structure.

#### 1.3: "What a State"

Problem: Our CMS components are drilling the data down from the top level through all the child components.
Implementation: Props should not be passed from a top component through multiple child component levels.
Goal: A composable structure of react components which are not tightly coupled due to the data requirements.


### 2: "Fun with Forms"

#### 2.1: "Contact Quest"

Problem: Customers need to use the contact form, but it doesn't currently function.
Implementation: Submit all form field data and show the success message to the customer.
Goal: To transmit our customer's queries, quests and complaints to NextJS Server Side backend.

#### 2.2: "Error Wrangler"

Problem: Customer are naughty and enter all sorts of invalid data.
Implementation: The API returns errors for each of the fields, use a validation library to display them back to the customer, 
    improving our customer's experience.
Goal: Handle all API messages and locate them next to their relevant form fields.

#### 2.3: "Sole Submitter"

Problem: Some of our customers click really fast, creating duplicate contact requests.
Implementation: Use state on the form to prevent double entries and show loading states. 
    Form data should be cleared on a successful response from our api.
Goal: Visual loading state for the customer and prevent multiple form submissions with the same values.


### 3: "Guardians of the Gateway"

### 3.1: "Header Hero"

Problem: The API responses can't be consumed by the frontend when running on `api.mayhem.local` due to missing CORS headers.
Implementation: API end points should return CORS related headers to allow cross origin communications.
Goal: Login via the API domain communicated to the backend without CORS related errors.

#### 3.2: "Fun with Tokens"

Cookies and tokens

Problem: The login form `/login` doesn't issue an authentication token after submitting the login form with valid credentials.
Implementation: Issue an industry standard authentication token with which to identify our logged in user, validating their credentials.
Goal: To be able to identify our users via their token and persist this to their browser.

#### 3.3: "Keys to the Castle"

Problem: Now we have the user token, we need to exchange this to enable our users to be known around the application.
Implementation: Consume the token to provide to the client side an indication our customer is logged in.
Goal: Customers should see they are logged in with a token.

#### 3.4: "Nothing to see here"

Problem: Users could forge a token, we need to ensure these tokens are valid.
Implementation: Implement validation of the tokens and make sure these cannot be manually forged.
Goal: Secure our customer sessions.


### 4: "Can you keep a secret?"

### 4.1: "Data Sanitizer"

Problem: The API is exposing sensitive user data (secret keys) that shouldn't be accessible from the frontend.
Implementation: On the user dashboard the api is returning the user's secret field, 
    this should not be exposed to the frontend.
Goal: Keys should only be accessible NextJS Server Side and not exposed to the browser.
