# Backend Notification Support Requirements

Source spreadsheet: `D:\SquarFT_Project_Panel_Simple_Notifications_Updated.xlsx`

This document is for backend implementation only. No backend files were changed while preparing it.

## Current Frontend Contract

The Project Panel app is configured for Expo push notifications and sends device registration data to:

- Default register endpoint: `POST /api/v1/push-notifications/register`
- Default unregister endpoint: `POST /api/v1/push-notifications/unregister`
- Override env keys:
  - `EXPO_PUBLIC_PUSH_TOKEN_ENDPOINT`
  - `EXPO_PUBLIC_PUSH_TOKEN_UNREGISTER_ENDPOINT`
- Token sync is disabled until backend support exists:
  - `EXPO_PUBLIC_PUSH_TOKEN_SYNC_ENABLED=false`
  - Set `EXPO_PUBLIC_PUSH_TOKEN_SYNC_ENABLED=true` after the register/unregister endpoints are deployed.

Registration payload includes both camelCase and snake_case fields so backend can choose one style:

```json
{
  "appKey": "project_panel_app",
  "app_key": "project_panel_app",
  "expoPushToken": "ExponentPushToken[...]",
  "expo_push_token": "ExponentPushToken[...]",
  "devicePushToken": "native-device-token-if-available",
  "device_push_token": "native-device-token-if-available",
  "userId": "user-id-if-known",
  "user_id": "user-id-if-known",
  "platform": "android",
  "projectId": "eas-project-id",
  "androidChannelId": "project-panel-alerts",
  "android_channel_id": "project-panel-alerts",
  "androidPackage": "com.kartik2611mishra.squarftprojectpanel",
  "android_package": "com.kartik2611mishra.squarftprojectpanel",
  "appVersion": "1.0.0",
  "deviceName": "device-name"
}
```

Login/register also include the cached Expo token when available:

```json
{
  "appKey": "project_panel_app",
  "app_key": "project_panel_app",
  "expoPushToken": "ExponentPushToken[...]",
  "expo_push_token": "ExponentPushToken[...]"
}
```

Push payloads sent to Expo should include:

```json
{
  "to": "ExponentPushToken[...]",
  "sound": "default",
  "channelId": "project-panel-alerts",
  "title": "Project Approved",
  "body": "Skyline Heights is approved and verified. Your project is now active.",
  "data": {
    "eventKey": "PP_PROJECT_APPROVED",
    "project_id": "project-123",
    "project_name": "Skyline Heights"
  }
}
```

## Backend Support Already Present

These pieces already exist in `D:\project_panel\squarFT_backend` and can be reused:

| Existing support | Location | Notes |
| --- | --- | --- |
| `notifications` table | `src/migrations/001_schema_creation.js` | Stores `user_id`, `type`, `channel`, `title`, `body`, `metadata`, `is_read`, `read_at`, `sent_at`. |
| Notification indexes | `src/migrations/001_schema_creation.js` | Has indexes for user, unread, and sent time. |
| Notification channel enum | `src/migrations/001_schema_creation.js` | Existing values are `in_app`, `email`, `sms`. It does not include `push`. |
| Notification type enum | `src/migrations/001_schema_creation.js` | Has generic/product values, but not the Project Panel `PP_*` event keys. |
| `sendNotification` helper | `src/utils/sendNotification.js` | Inserts an in-app notification row and emits a socket event to `user_${userId}`. |
| Realtime socket emit | `src/utils/sendNotification.js` | Emits `new_notification` after DB insert. |
| Some backend callers | broker controllers/wallet/KYC code | Several broker flows already call `sendNotification`. Project Panel-specific events still need producers. |
| Broker notification listing | `src/routes/broker/brokerRoutes.js` and `src/controllers/broker/brokerController.js` | Broker has a notifications fetch path. Project Panel may need its own listing/mark-read APIs if not sharing this. |

Important gap: I did not find backend support for push-token/device-token persistence, Expo Push API sending, FCM V1 sending, push receipts, or Project Panel `PP_*` event producers.

## Backend Support Still Needed

### 1. Device Token Storage

Add a table for push-capable devices, for example `user_push_tokens`.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `id` | Primary key. |
| `user_id` | Owner user. Nullable only if pre-login OTP push must be supported before auth. |
| `app_key` | Must support `project_panel_app`. |
| `platform` | `android`, `ios`, etc. |
| `expo_push_token` | Expo token used by Expo Push API. |
| `device_push_token` | Native FCM/APNs token if backend wants direct FCM later. |
| `android_package` | Should be `com.kartik2611mishra.squarftprojectpanel`. |
| `android_channel_id` | Should be `project-panel-alerts`. |
| `eas_project_id` | Useful for debugging environment mismatches. |
| `app_version` | Useful for support/debugging. |
| `device_name` | Optional support/debug field. |
| `is_active` | Set false on logout/unregister or invalid token receipt. |
| `last_seen_at` | Updated on registration. |
| `created_at`, `updated_at` | Audit timestamps. |

Recommended uniqueness:

- Unique active token by `app_key + expo_push_token`.
- Optionally unique latest device by `user_id + app_key + platform + device_push_token`.

### 2. Token Registration Endpoints

Add authenticated endpoints:

- `POST /api/v1/push-notifications/register`
- `POST /api/v1/push-notifications/unregister`

Register should:

- Read authenticated user from JWT when available.
- Accept `expoPushToken` or `expo_push_token`.
- Accept `appKey` or `app_key`.
- Validate `app_key === "project_panel_app"` for this app.
- Upsert token as active.
- Associate token with `req.user.id`.
- Return a small success response.

Unregister should:

- Mark the matching token inactive.
- Scope by authenticated user where possible.

Pre-auth OTP push is in the spreadsheet. If backend truly needs push before login, it needs one of these:

- A pre-auth device registration endpoint with abuse limits, or
- Registration/login APIs must save the provided `expo_push_token` before sending OTP.

### 3. Push Send Service

Add a reusable service, separate from `sendNotification`, that:

- Looks up active tokens for `user_id + app_key`.
- Sends messages through Expo Push API, or direct FCM V1 if backend chooses native sending.
- Uses `channelId: "project-panel-alerts"` for Android.
- Adds `data.eventKey` and event data in every push payload.
- Handles invalid tokens and deactivates them.
- Stores push send status/receipts if possible.

Recommended behavior:

- For every spreadsheet event with `Push + In-App`, first create the in-app notification row, then send push.
- If push fails, keep the in-app notification row and record push failure details for debugging.

### 4. Notification Table/Enum Compatibility

Current `notification_channel` enum lacks `push`. Options:

- Add `push` to the enum and write separate `push` channel records, or
- Keep notification center records as `in_app` and store push-send status in a separate table.

Current `notification_type` enum lacks Project Panel event keys. Options:

- Add all `PP_*` keys to the enum, or
- Store `type = "general"` and put `eventKey` in `metadata`.

Lower-friction recommendation:

- Keep `notifications.channel = "in_app"` for notification-center records.
- Store `metadata.eventKey = "PP_PROJECT_APPROVED"` and event-specific IDs/data in `metadata`.
- Add a separate `notification_push_sends` table if delivery auditing is needed.

### 5. Project Panel Notification Center APIs

The frontend currently has local Redux notification state. For real persisted notifications, backend should expose Project Panel endpoints:

- `GET /api/v1/project-panel/notifications`
- `PATCH /api/v1/project-panel/notifications/:id/read`
- `PATCH /api/v1/project-panel/notifications/read-all`

Response should include:

- `id`
- `title`
- `body`
- `eventKey`
- `metadata`
- `is_read`
- `sent_at`

### 6. Event Producers

Backend needs to trigger these events at the correct business points.

| Event Key | Channels | Backend trigger/support needed |
| --- | --- | --- |
| `PP_REGISTRATION_OTP` | SMS + Push + In-App | Send OTP by SMS, optionally push, save in-app record, expire OTP in 5 minutes, throttle resend attempts. |
| `PP_KYC_DOCUMENT_UPLOADED` | In-App only | Create in-app record only after document upload. Do not send system push. |
| `PP_KYC_SUBMITTED` | Push + In-App | On KYC submission, set status to `UNDER_REVIEW`, create in-app record, send push. |
| `PP_KYC_APPROVED` | Push + In-App | On admin approval, unlock project upload, create in-app record, send push. |
| `PP_KYC_REJECTED` | Push + In-App | Require `rejection_reason`, create in-app record, send push, route to correction context. |
| `PP_NEW_PROJECT_STARTED` | In-App only | Create in-app confirmation only when a project draft starts. Do not send system push. |
| `PP_PROJECT_FORM_INCOMPLETE` | Push + In-App | Scheduled inactivity job; send at most once per day; stop after project submission. |
| `PP_PROJECT_FORM_COMPLETED` | In-App only | Create in-app success only when all 6 steps complete. Do not send system push. |
| `PP_PROJECT_SUBMITTED_FOR_REVIEW` | Push + In-App | On submission, set project status to `UNDER_REVIEW`, create in-app record, send push. |
| `PP_PROJECT_APPROVED` | Push + In-App | On final verification approval, create in-app record, send push. |
| `PP_PROJECT_REJECTED` | Push + In-App | Require `rejection_reason` and `rejected_step`, create in-app record, send push. |
| `PP_DEAL_STARTED` | Push + In-App | On deal creation/start, notify authorized Project Panel users only. |
| `PP_UNIT_SOLD` | Push + In-App | On unit sold status, update inventory, create in-app record, send push. |
| `PP_PAYMENT_MILESTONE_CREATED` | Push + In-App | On milestone creation, create in-app record, send push. |
| `PP_PAYMENT_DUE` | Push + In-App | Scheduled jobs: once 3 days before due date and once on due date. |
| `PP_PAYMENT_RECEIVED` | Push + In-App | Send only after payment is confirmed. |

### 7. Payload Templates

Backend should use these exact titles and body templates unless product copy changes.

| Event Key | Push Title | Push Body |
| --- | --- | --- |
| `PP_REGISTRATION_OTP` | `Your OTP` | `Your OTP is {{otp}}. Do not share it with anyone.` |
| `PP_KYC_DOCUMENT_UPLOADED` | `KYC Document Uploaded` | `Your document is uploaded. Please upload the remaining documents.` |
| `PP_KYC_SUBMITTED` | `KYC Under Review` | `Your KYC has been sent for checking.` |
| `PP_KYC_APPROVED` | `KYC Approved` | `Your KYC is approved. You can now upload projects.` |
| `PP_KYC_REJECTED` | `Fix Your KYC` | `Your KYC was not approved. Reason: {{rejection_reason}}. Please upload the document again.` |
| `PP_NEW_PROJECT_STARTED` | `New Project Started` | `{{project_name}} is added. Complete all 6 steps to send it for review.` |
| `PP_PROJECT_FORM_INCOMPLETE` | `Complete Your Project` | `{{project_name}} is not complete. Please finish Step {{current_step}} of 6: {{current_step_name}}.` |
| `PP_PROJECT_FORM_COMPLETED` | `Project Details Complete` | `{{project_name}} is complete. Now submit it for review.` |
| `PP_PROJECT_SUBMITTED_FOR_REVIEW` | `Project Under Review` | `{{project_name}} has been sent for review. We will update you soon.` |
| `PP_PROJECT_APPROVED` | `Project Approved` | `{{project_name}} is approved and verified. Your project is now active.` |
| `PP_PROJECT_REJECTED` | `Fix Your Project` | `{{project_name}} needs correction. Reason: {{rejection_reason}}.` |
| `PP_DEAL_STARTED` | `Deal Started` | `A deal has started for {{unit_name}} in {{project_name}}. Buyer: {{buyer_name}}.` |
| `PP_UNIT_SOLD` | `Unit Sold` | `{{unit_name}} in {{project_name}} is sold to {{buyer_name}}. Your inventory is updated.` |
| `PP_PAYMENT_MILESTONE_CREATED` | `Payment Scheduled` | `Payment of {{amount}} from {{buyer_name}} for {{unit_name}} is due on {{due_date}}.` |
| `PP_PAYMENT_DUE` | `Payment Due` | `Payment of {{amount}} from {{buyer_name}} for {{unit_name}} is due on {{due_date}}.` |
| `PP_PAYMENT_RECEIVED` | `Payment Received` | `Payment of {{amount}} from {{buyer_name}} for {{unit_name}} has been received.` |

### 8. Required Event Data

| Event Key | Required data |
| --- | --- |
| `PP_REGISTRATION_OTP` | `otp`, `expires_minutes` |
| `PP_KYC_DOCUMENT_UPLOADED` | `uploaded_document_name`, `pending_document_count` |
| `PP_KYC_SUBMITTED` | `kyc_reference` |
| `PP_KYC_APPROVED` | `approved_at` |
| `PP_KYC_REJECTED` | `rejection_reason`, `rejected_document_name` |
| `PP_NEW_PROJECT_STARTED` | `project_id`, `project_name` |
| `PP_PROJECT_FORM_INCOMPLETE` | `project_id`, `project_name`, `current_step`, `current_step_name`, `completed_steps` |
| `PP_PROJECT_FORM_COMPLETED` | `project_id`, `project_name`, `property_types_count`, `unit_count` |
| `PP_PROJECT_SUBMITTED_FOR_REVIEW` | `project_id`, `project_name`, `submitted_at` |
| `PP_PROJECT_APPROVED` | `project_id`, `project_name`, `approved_at` |
| `PP_PROJECT_REJECTED` | `project_id`, `project_name`, `rejection_reason`, `rejected_step`, `rejected_section_name` |
| `PP_DEAL_STARTED` | `project_id`, `project_name`, `deal_id`, `unit_id`, `unit_name`, `buyer_name` |
| `PP_UNIT_SOLD` | `project_id`, `project_name`, `unit_id`, `unit_name`, `buyer_name`, `sold_at` |
| `PP_PAYMENT_MILESTONE_CREATED` | `project_id`, `milestone_id`, `unit_id`, `unit_name`, `buyer_name`, `amount`, `due_date`, `milestone_name` |
| `PP_PAYMENT_DUE` | `project_id`, `milestone_id`, `unit_name`, `buyer_name`, `amount`, `due_date` |
| `PP_PAYMENT_RECEIVED` | `project_id`, `milestone_id`, `unit_name`, `buyer_name`, `amount`, `received_at` |

### 9. Privacy And Authorization Rules

- Only notify authorized Project Panel users for the project.
- For deal, sold-unit, and payment alerts, push text may include `buyer_name` only if the recipient is authorized.
- Never include buyer phone number, private documents, bank details, or internal notes in push title/body.
- Store sensitive detail only behind authenticated APIs, not in push payload text.
- Validate `project_id` ownership/access before notification list reads and mark-read updates.

### 10. Idempotency And Throttling

Use idempotency to avoid duplicate notifications.

Recommended idempotency keys:

- Project status events: `project_id + event_key + status_version`
- Project rejection: `project_id + event_key + rejected_step + status_version`
- Deal started: `deal_id + event_key`
- Unit sold: `unit_id + event_key + sold_at`
- Payment milestone created: `milestone_id + event_key`
- Payment due: `milestone_id + event_key + due_date + reminder_offset`
- Payment received: `milestone_id + event_key + received_at`

Throttle:

- `PP_PROJECT_FORM_INCOMPLETE`: max once per day per project until submission.
- OTP resend: backend-defined strict resend limit and expiry in 5 minutes.

## Minimal Backend Checklist

- [ ] Add push token table.
- [ ] Add register/unregister endpoints.
- [ ] Save token from login/register payload when present.
- [ ] Add push send service with Expo Push API or FCM V1.
- [ ] Add Project Panel notification list/read APIs, or explicitly share an existing notification endpoint.
- [ ] Add Project Panel event producers for all `PP_*` events.
- [ ] Ensure every push event also creates an in-app notification row.
- [ ] Enforce in-app-only events never send phone push.
- [ ] Add idempotency/throttling.
- [ ] Add privacy filtering for buyer/payment data.
- [ ] Store/send `data.eventKey` in every push payload.
