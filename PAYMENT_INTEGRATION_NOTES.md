Requirements for Paystack integration (frontend/backend):

Frontend:
- `StudentCourses` posts to `/payments/initialize` with `courseId` and optional `callback` param.
- Backend should respond with `{ authorization_url, reference }` where `reference` is the payment reference.
- Paystack return URL should be set to `https://<your-frontend>/payments/callback` (or use the `callback` param to override).
- Frontend `PaymentCallback` calls `/payments/verify?reference=...` to let backend confirm the transaction and complete enrollment.

Backend:
- POST `/payments/initialize` should accept `{ courseId }` and optional `callback` query param.
  - Create transaction with Paystack using server-side secret key.
  - Save a pending payment record with `reference`, `courseId`, `studentId`, `amount`.
  - Return `{ authorization_url, reference }`.
- GET `/payments/verify?reference=` should verify payment with Paystack and update payment and enrollment records.
  - On success, mark payment recorded and enroll user in course (or return that the user was enrolled).
  - Return `{ success: true, courseId, message }` on success, else `{ success: false, message }`.

Security:
- Use server-side verification only (do not trust client-side callbacks alone).
- Ensure `reference` is validated and rate-limited.

Notes:
- I added `PaymentCallback.jsx` and a route at `/payments/callback`.
- The frontend opens Paystack in a new tab and navigates the current tab to the callback with `reference` for verification UI.
