export enum NotificationTypeEnum {
  appointmentConfirmed = 'appointment_confirmed',
  appointmentCancelled = 'appointment_cancelled',
  appointmentReminder = 'appointment_reminder',
  appointmentRescheduled = 'appointment_rescheduled',
  paymentReceived = 'payment_received',
  prescriptionReady = 'prescription_ready',
  labResultReady = 'lab_result_ready',
  general = 'general',
}

export enum NotificationChannelEnum {
  email = 'email',
  sms = 'sms',
  push = 'push',
  inApp = 'in_app',
}