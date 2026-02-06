export enum AppointmentStatusEnum {
  pending = 'pending', 
  confirmed = 'confirmed', 
  cancelled = 'cancelled', 
  completed = 'completed', 
  noShow = 'no_show', 
  rescheduled = 'rescheduled',
}

export enum AppointmentTypeEnum {
  checkup = 'checkup', 
  followUp = 'follow_up', 
  consultation = 'consultation',
  emergency = 'emergency',
  surgery = 'surgery', 
  vaccination = 'vaccination',
  labTest = 'lab_test', 
  imaging = 'imaging', 
}

export enum ConsultationModeEnum {
  inClinic = 'in_clinic',
  online = 'online', 
  homeVisit = 'home_visit', 
}