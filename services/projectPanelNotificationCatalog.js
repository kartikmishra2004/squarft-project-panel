export const PROJECT_PANEL_NOTIFICATION_EVENTS = {
    PP_REGISTRATION_OTP: {
        channels: ["sms", "push", "in_app"],
        title: "Your OTP",
        message: "Your OTP is {{otp}}. Do not share it with anyone.",
        sheetRoute: "/auth/verify-otp",
        appRoute: "/otp-verification",
        requiredData: ["otp", "expires_minutes"],
    },
    PP_KYC_DOCUMENT_UPLOADED: {
        channels: ["in_app"],
        title: "KYC Document Uploaded",
        message: "Your document is uploaded. Please upload the remaining documents.",
        sheetRoute: "/kyc",
        appRoute: "/(screens)/notifications",
        requiredData: ["uploaded_document_name", "pending_document_count"],
    },
    PP_KYC_SUBMITTED: {
        channels: ["push", "in_app"],
        title: "KYC Under Review",
        message: "Your KYC has been sent for checking.",
        sheetRoute: "/kyc/status",
        appRoute: "/(screens)/notifications",
        requiredData: ["kyc_reference"],
    },
    PP_KYC_APPROVED: {
        channels: ["push", "in_app"],
        title: "KYC Approved",
        message: "Your KYC is approved. You can now upload projects.",
        sheetRoute: "/projects",
        appRoute: "/(tabs)/home",
        requiredData: ["approved_at"],
    },
    PP_KYC_REJECTED: {
        channels: ["push", "in_app"],
        title: "Fix Your KYC",
        message: "Your KYC was not approved. Reason: {{rejection_reason}}. Please upload the document again.",
        sheetRoute: "/kyc/correction",
        appRoute: "/(screens)/notifications",
        requiredData: ["rejection_reason", "rejected_document_name"],
    },
    PP_NEW_PROJECT_STARTED: {
        channels: ["in_app"],
        title: "New Project Started",
        message: "{{project_name}} is added. Complete all 6 steps to send it for review.",
        sheetRoute: "/projects/{{project_id}}/form/step/1",
        appRoute: "/(tabs)/add-project",
        requiredData: ["project_id", "project_name"],
    },
    PP_PROJECT_FORM_INCOMPLETE: {
        channels: ["push", "in_app"],
        title: "Complete Your Project",
        message: "{{project_name}} is not complete. Please finish Step {{current_step}} of 6: {{current_step_name}}.",
        sheetRoute: "/projects/{{project_id}}/form/step/{{current_step}}",
        appRoute: "/(tabs)/add-project",
        requiredData: ["project_id", "project_name", "current_step", "current_step_name", "completed_steps"],
    },
    PP_PROJECT_FORM_COMPLETED: {
        channels: ["in_app"],
        title: "Project Details Complete",
        message: "{{project_name}} is complete. Now submit it for review.",
        sheetRoute: "/projects/{{project_id}}/review",
        appRoute: "/(tabs)/home",
        requiredData: ["project_id", "project_name", "property_types_count", "unit_count"],
    },
    PP_PROJECT_SUBMITTED_FOR_REVIEW: {
        channels: ["push", "in_app"],
        title: "Project Under Review",
        message: "{{project_name}} has been sent for review. We will update you soon.",
        sheetRoute: "/projects/{{project_id}}/review-status",
        appRoute: "/(tabs)/home",
        requiredData: ["project_id", "project_name", "submitted_at"],
    },
    PP_PROJECT_APPROVED: {
        channels: ["push", "in_app"],
        title: "Project Approved",
        message: "{{project_name}} is approved and verified. Your project is now active.",
        sheetRoute: "/projects/{{project_id}}",
        appRoute: "/(tabs)/home",
        requiredData: ["project_id", "project_name", "approved_at"],
    },
    PP_PROJECT_REJECTED: {
        channels: ["push", "in_app"],
        title: "Fix Your Project",
        message: "{{project_name}} needs correction. Reason: {{rejection_reason}}.",
        sheetRoute: "/projects/{{project_id}}/correction?step={{rejected_step}}",
        appRoute: "/(tabs)/add-project",
        requiredData: ["project_id", "project_name", "rejection_reason", "rejected_step", "rejected_section_name"],
    },
    PP_DEAL_STARTED: {
        channels: ["push", "in_app"],
        title: "Deal Started",
        message: "A deal has started for {{unit_name}} in {{project_name}}. Buyer: {{buyer_name}}.",
        sheetRoute: "/projects/{{project_id}}/deals/{{deal_id}}",
        appRoute: "/(tabs)/home",
        requiredData: ["project_id", "project_name", "deal_id", "unit_id", "unit_name", "buyer_name"],
        privateFields: ["buyer_phone", "documents", "internal_notes"],
    },
    PP_UNIT_SOLD: {
        channels: ["push", "in_app"],
        title: "Unit Sold",
        message: "{{unit_name}} in {{project_name}} is sold to {{buyer_name}}. Your inventory is updated.",
        sheetRoute: "/projects/{{project_id}}/inventory/{{unit_id}}",
        appRoute: "/(tabs)/home",
        requiredData: ["project_id", "project_name", "unit_id", "unit_name", "buyer_name", "sold_at"],
        privateFields: ["buyer_phone", "documents", "internal_notes"],
    },
    PP_PAYMENT_MILESTONE_CREATED: {
        channels: ["push", "in_app"],
        title: "Payment Scheduled",
        message: "Payment of {{amount}} from {{buyer_name}} for {{unit_name}} is due on {{due_date}}.",
        sheetRoute: "/projects/{{project_id}}/payment-milestones/{{milestone_id}}",
        appRoute: "/(tabs)/home",
        requiredData: ["project_id", "milestone_id", "unit_id", "unit_name", "buyer_name", "amount", "due_date", "milestone_name"],
        privateFields: ["bank_details", "payment_documents", "internal_notes"],
    },
    PP_PAYMENT_DUE: {
        channels: ["push", "in_app"],
        title: "Payment Due",
        message: "Payment of {{amount}} from {{buyer_name}} for {{unit_name}} is due on {{due_date}}.",
        sheetRoute: "/projects/{{project_id}}/payment-milestones/{{milestone_id}}",
        appRoute: "/(tabs)/home",
        requiredData: ["project_id", "milestone_id", "unit_name", "buyer_name", "amount", "due_date"],
    },
    PP_PAYMENT_RECEIVED: {
        channels: ["push", "in_app"],
        title: "Payment Received",
        message: "Payment of {{amount}} from {{buyer_name}} for {{unit_name}} has been received.",
        sheetRoute: "/projects/{{project_id}}/payment-milestones/{{milestone_id}}",
        appRoute: "/(tabs)/home",
        requiredData: ["project_id", "milestone_id", "unit_name", "buyer_name", "amount", "received_at"],
    },
};

export const PROJECT_PANEL_PUSH_EVENT_KEYS = Object.entries(PROJECT_PANEL_NOTIFICATION_EVENTS)
    .filter(([, definition]) => definition.channels.includes("push"))
    .map(([eventKey]) => eventKey);

export const getProjectPanelNotificationEvent = (eventKey) =>
    PROJECT_PANEL_NOTIFICATION_EVENTS[eventKey] || null;

export const interpolateNotificationTemplate = (template, data = {}) =>
    template.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
        const value = data[key.trim()];
        return value === undefined || value === null ? "" : String(value);
    });

export const buildProjectPanelNotificationContent = (eventKey, data = {}) => {
    const definition = getProjectPanelNotificationEvent(eventKey);
    if (!definition) return null;

    return {
        eventKey,
        title: definition.title,
        message: interpolateNotificationTemplate(definition.message, data),
        route: interpolateNotificationTemplate(definition.sheetRoute, data),
        appRoute: definition.appRoute,
        data,
    };
};

export const getNotificationEventKeyFromData = (data = {}) =>
    data.eventKey || data.event_key || data.notification_event || data.type || null;
