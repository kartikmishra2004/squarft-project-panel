# Project Panel Push Notifications

Source spreadsheet: `D:\SquarFT_Project_Panel_Simple_Notifications_Updated.xlsx`

## Implemented Frontend Scope

- Registers the device with Expo Notifications.
- Creates Android channel `project-panel-alerts`.
- Sends `appKey: project_panel_app`, `androidPackage: com.kartik2611mishra.squarftprojectpanel`, and the Expo token to the configured token registration endpoint.
- Mounts `PushNotificationRegistrar` once from `app/_layout.jsx`.
- Saves received push notifications into the existing in-app notification list.
- Routes notification taps by `eventKey` / `event_key` and sheet route.
- Keeps a catalog for every spreadsheet event in `services/projectPanelNotificationCatalog.js`.

## Required Keys And Files

| Item | Value |
| --- | --- |
| App key | `project_panel_app` |
| Android package | `com.kartik2611mishra.squarftprojectpanel` |
| Android notification channel | `project-panel-alerts` |
| URL scheme | `squarftprojectpanel` |
| Firebase Android config | `google-services.json` in the frontend root |
| EAS project ID | `app.json > expo.extra.eas.projectId` or `.env` as `EXPO_PUBLIC_EAS_PROJECT_ID` |
| API base URL | `.env` as `EXPO_PUBLIC_API_BASE_URL` |
| Backend token sync flag | `.env` as `EXPO_PUBLIC_PUSH_TOKEN_SYNC_ENABLED`; keep `false` until backend register/unregister endpoints exist |
| Push-token endpoint | `.env` as `EXPO_PUBLIC_PUSH_TOKEN_ENDPOINT` if backend route is not `/api/v1/push-notifications/register` |
| Push unregister endpoint | `.env` as `EXPO_PUBLIC_PUSH_TOKEN_UNREGISTER_ENDPOINT` if backend route is not `/api/v1/push-notifications/unregister` |
| FCM V1 service account | Upload to EAS credentials; do not commit it |

## Backend Support Needed

No backend changes were made. The current backend checkout has an in-app `notifications` table and `sendNotification` utility, but I did not find push-token registration or Expo/FCM push sending support.

Backend still needs:

- A token registration endpoint that accepts the frontend payload from `services/notificationApi.js`.
- A device-token table keyed by `user_id`, `app_key`, `platform`, and Expo push token.
- Push sending via Expo Push API or FCM V1.
- A notification-center write for every push event.
- Event producers for each spreadsheet event key.
- Idempotency for project events using `project_id + event_key + status version`.
- Daily throttling for `PP_PROJECT_FORM_INCOMPLETE`.
- Payment schedule jobs for `PP_PAYMENT_DUE`: once 3 days before due date and once on due date.
- Rejection validation requiring `rejection_reason` and, for project rejection, `rejected_step`.
- Privacy filtering so push text never contains phone numbers, private documents, bank details, or internal notes.

## Commands

```powershell
cd "D:\project_panel\squarft-project-panel"
npm install
npx eas-cli@latest credentials -p android
npx eas-cli@latest build --profile development --platform android
npx expo start --dev-client
```

Push notifications require a development or release build. They do not work for Android remote push in Expo Go.

## Manual Push Test Flow

1. Install and open the development build.
2. Log in.
3. Allow notification permission.
4. Watch Metro/device logs for:

```text
[PUSH] Registered Expo push token: ExponentPushToken[...]
```

5. Open Expo's push tool: `https://expo.dev/notifications`
6. Send a JSON payload using the event key being tested.

Example payload:

```json
{
  "to": "ExponentPushToken[replace-me]",
  "sound": "default",
  "channelId": "project-panel-alerts",
  "title": "Project Approved",
  "body": "Skyline Heights is approved and verified. Your project is now active.",
  "data": {
    "eventKey": "PP_PROJECT_APPROVED",
    "project_id": "project-123",
    "project_name": "Skyline Heights",
    "approved_at": "2026-07-03T10:00:00.000Z"
  }
}
```

Expected result:

- Foreground: notification is added to the app notification center.
- Background/closed app: system notification appears.
- Tap: app opens the route configured for the event.

## Event Test Matrix

Current app routes are limited. Sheet routes that do not have dedicated screens yet are mapped to the closest existing screen or the notification center.

| Event Key | Channels | Test Data | Expected Frontend Result | Backend Support Needed |
| --- | --- | --- | --- | --- |
| `PP_REGISTRATION_OTP` | SMS + Push + In-App | `otp`, `expires_minutes` | Push title `Your OTP`; tap opens `/otp-verification`. | Backend must send SMS, create OTP with 5 minute expiry, limit resend attempts, and send push to a pre-auth or recently registered device token. |
| `PP_KYC_DOCUMENT_UPLOADED` | In-App only | `uploaded_document_name`, `pending_document_count` | No push should be sent. In-app notification can use catalog title `KYC Document Uploaded`. | Backend should create only an in-app notification record. |
| `PP_KYC_SUBMITTED` | Push + In-App | `kyc_reference` | Tap opens notification center because no KYC status screen exists in this app. | Backend must set KYC status to `UNDER_REVIEW` and send push plus in-app record. |
| `PP_KYC_APPROVED` | Push + In-App | `approved_at` | Tap opens home/projects. | Backend must unlock project upload after approval and send push plus in-app record. |
| `PP_KYC_REJECTED` | Push + In-App | `rejection_reason`, `rejected_document_name` | Tap opens notification center because no KYC correction screen exists in this app. | Backend must require rejection reason and send push plus in-app record. |
| `PP_NEW_PROJECT_STARTED` | In-App only | `project_id`, `project_name` | No push should be sent. In-app confirmation can open add project. | Backend/frontend flow should create only an in-app confirmation if needed. |
| `PP_PROJECT_FORM_INCOMPLETE` | Push + In-App | `project_id`, `project_name`, `current_step`, `current_step_name`, `completed_steps` | Tap opens add project. | Backend needs inactivity detection, once-per-day throttle, and stop-after-submission logic. |
| `PP_PROJECT_FORM_COMPLETED` | In-App only | `project_id`, `project_name`, `property_types_count`, `unit_count` | No push should be sent. In-app success can open home/projects. | Backend/frontend flow should create only an in-app success message. |
| `PP_PROJECT_SUBMITTED_FOR_REVIEW` | Push + In-App | `project_id`, `project_name`, `submitted_at` | Tap opens home/projects. | Backend must set project status to `UNDER_REVIEW` and send push plus in-app record. |
| `PP_PROJECT_APPROVED` | Push + In-App | `project_id`, `project_name`, `approved_at` | Tap opens home/projects. | Backend must send only after required checks are complete. |
| `PP_PROJECT_REJECTED` | Push + In-App | `project_id`, `project_name`, `rejection_reason`, `rejected_step`, `rejected_section_name` | Tap opens add project. | Backend must require reason and rejected step before rejected/returned status. |
| `PP_DEAL_STARTED` | Push + In-App | `project_id`, `project_name`, `deal_id`, `unit_id`, `unit_name`, `buyer_name` | Tap opens home/projects. | Backend must send only to authorized Project Panel users and exclude buyer phone/private notes. |
| `PP_UNIT_SOLD` | Push + In-App | `project_id`, `project_name`, `unit_id`, `unit_name`, `buyer_name`, `sold_at` | Tap opens home/projects. | Backend must update inventory and exclude buyer phone/documents from push text. |
| `PP_PAYMENT_MILESTONE_CREATED` | Push + In-App | `project_id`, `milestone_id`, `unit_id`, `unit_name`, `buyer_name`, `amount`, `due_date`, `milestone_name` | Tap opens home/projects. | Backend must exclude bank/sensitive payment details from push text. |
| `PP_PAYMENT_DUE` | Push + In-App | `project_id`, `milestone_id`, `unit_name`, `buyer_name`, `amount`, `due_date` | Tap opens home/projects. | Backend must schedule once 3 days before and once on due date. |
| `PP_PAYMENT_RECEIVED` | Push + In-App | `project_id`, `milestone_id`, `unit_name`, `buyer_name`, `amount`, `received_at` | Tap opens home/projects. | Backend must send only after payment confirmation. |

## Per-Event Expo Push Payloads

Use the same `to`, `sound`, and `channelId` fields for all push events. Change `title`, `body`, and `data`.

`PP_REGISTRATION_OTP`

```json
{
  "title": "Your OTP",
  "body": "Your OTP is 123456. Do not share it with anyone.",
  "data": {
    "eventKey": "PP_REGISTRATION_OTP",
    "otp": "123456",
    "expires_minutes": 5
  }
}
```

`PP_KYC_SUBMITTED`

```json
{
  "title": "KYC Under Review",
  "body": "Your KYC has been sent for checking.",
  "data": {
    "eventKey": "PP_KYC_SUBMITTED",
    "kyc_reference": "KYC-1001"
  }
}
```

`PP_KYC_APPROVED`

```json
{
  "title": "KYC Approved",
  "body": "Your KYC is approved. You can now upload projects.",
  "data": {
    "eventKey": "PP_KYC_APPROVED",
    "approved_at": "2026-07-03T10:00:00.000Z"
  }
}
```

`PP_KYC_REJECTED`

```json
{
  "title": "Fix Your KYC",
  "body": "Your KYC was not approved. Reason: Address proof is unclear. Please upload the document again.",
  "data": {
    "eventKey": "PP_KYC_REJECTED",
    "rejection_reason": "Address proof is unclear",
    "rejected_document_name": "Address proof"
  }
}
```

`PP_PROJECT_FORM_INCOMPLETE`

```json
{
  "title": "Complete Your Project",
  "body": "Skyline Heights is not complete. Please finish Step 4 of 6: Inventory.",
  "data": {
    "eventKey": "PP_PROJECT_FORM_INCOMPLETE",
    "project_id": "project-123",
    "project_name": "Skyline Heights",
    "current_step": 4,
    "current_step_name": "Inventory",
    "completed_steps": 3
  }
}
```

`PP_PROJECT_SUBMITTED_FOR_REVIEW`

```json
{
  "title": "Project Under Review",
  "body": "Skyline Heights has been sent for review. We will update you soon.",
  "data": {
    "eventKey": "PP_PROJECT_SUBMITTED_FOR_REVIEW",
    "project_id": "project-123",
    "project_name": "Skyline Heights",
    "submitted_at": "2026-07-03T10:00:00.000Z"
  }
}
```

`PP_PROJECT_APPROVED`

```json
{
  "title": "Project Approved",
  "body": "Skyline Heights is approved and verified. Your project is now active.",
  "data": {
    "eventKey": "PP_PROJECT_APPROVED",
    "project_id": "project-123",
    "project_name": "Skyline Heights",
    "approved_at": "2026-07-03T10:00:00.000Z"
  }
}
```

`PP_PROJECT_REJECTED`

```json
{
  "title": "Fix Your Project",
  "body": "Skyline Heights needs correction. Reason: Missing RERA document.",
  "data": {
    "eventKey": "PP_PROJECT_REJECTED",
    "project_id": "project-123",
    "project_name": "Skyline Heights",
    "rejection_reason": "Missing RERA document",
    "rejected_step": 2,
    "rejected_section_name": "Owner details"
  }
}
```

`PP_DEAL_STARTED`

```json
{
  "title": "Deal Started",
  "body": "A deal has started for A-1202 in Skyline Heights. Buyer: Rahul Sharma.",
  "data": {
    "eventKey": "PP_DEAL_STARTED",
    "project_id": "project-123",
    "project_name": "Skyline Heights",
    "deal_id": "deal-9001",
    "unit_id": "unit-1202",
    "unit_name": "A-1202",
    "buyer_name": "Rahul Sharma"
  }
}
```

`PP_UNIT_SOLD`

```json
{
  "title": "Unit Sold",
  "body": "A-1202 in Skyline Heights is sold to Rahul Sharma. Your inventory is updated.",
  "data": {
    "eventKey": "PP_UNIT_SOLD",
    "project_id": "project-123",
    "project_name": "Skyline Heights",
    "unit_id": "unit-1202",
    "unit_name": "A-1202",
    "buyer_name": "Rahul Sharma",
    "sold_at": "2026-07-03T10:00:00.000Z"
  }
}
```

`PP_PAYMENT_MILESTONE_CREATED`

```json
{
  "title": "Payment Scheduled",
  "body": "Payment of Rs. 5,00,000 from Rahul Sharma for A-1202 is due on 2026-07-10.",
  "data": {
    "eventKey": "PP_PAYMENT_MILESTONE_CREATED",
    "project_id": "project-123",
    "milestone_id": "milestone-1",
    "unit_id": "unit-1202",
    "unit_name": "A-1202",
    "buyer_name": "Rahul Sharma",
    "amount": "Rs. 5,00,000",
    "due_date": "2026-07-10",
    "milestone_name": "Booking amount"
  }
}
```

`PP_PAYMENT_DUE`

```json
{
  "title": "Payment Due",
  "body": "Payment of Rs. 5,00,000 from Rahul Sharma for A-1202 is due on 2026-07-10.",
  "data": {
    "eventKey": "PP_PAYMENT_DUE",
    "project_id": "project-123",
    "milestone_id": "milestone-1",
    "unit_name": "A-1202",
    "buyer_name": "Rahul Sharma",
    "amount": "Rs. 5,00,000",
    "due_date": "2026-07-10"
  }
}
```

`PP_PAYMENT_RECEIVED`

```json
{
  "title": "Payment Received",
  "body": "Payment of Rs. 5,00,000 from Rahul Sharma for A-1202 has been received.",
  "data": {
    "eventKey": "PP_PAYMENT_RECEIVED",
    "project_id": "project-123",
    "milestone_id": "milestone-1",
    "unit_name": "A-1202",
    "buyer_name": "Rahul Sharma",
    "amount": "Rs. 5,00,000",
    "received_at": "2026-07-03T10:00:00.000Z"
  }
}
```

## In-App Only Event Checks

These spreadsheet rows should not be sent as phone push notifications:

- `PP_KYC_DOCUMENT_UPLOADED`
- `PP_NEW_PROJECT_STARTED`
- `PP_PROJECT_FORM_COMPLETED`

For these, test by verifying the backend/frontend creates an in-app notification or local confirmation only. If a system push appears for any of these events, the channel policy is being violated.
