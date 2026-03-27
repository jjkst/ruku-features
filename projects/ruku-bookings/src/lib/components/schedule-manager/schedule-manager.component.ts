import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { MaterialModule } from '../../shared/material.module';
import { HorizontalCardListComponent } from '../horizontal-card-list/horizontal-card-list.component';
import { Schedule } from '../../models/schedule.model';
import { ScheduleService } from '../../services/schedule.service';
import { AvailabilityService } from '../../services/availability.service';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'app-schedule-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    HorizontalCardListComponent,
  ],
  templateUrl: './schedule-manager.component.html',
  styleUrls: ['./schedule-manager.component.scss'],
})
export class ScheduleManagerComponent extends BaseComponent implements OnInit, OnDestroy {
  appointmentForm!: FormGroup;
  availableDates: Date[] = [];
  availableTimeSlots: string[] = [];
  availableServices: string[] = [];
  scheduledAppointments: Schedule[] = [];
  formId: number | null = null;
  formbuttonText = 'Add Schedule';
  submitted = false;
  
  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private availabilityService: AvailabilityService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscriptions();
    Promise.all([this.loadSchedules(), this.loadAvailableDates()]);
  }

  private initializeForm(): void {
    this.appointmentForm = this.fb.group({
      ContactName: ['', Validators.required],
      SelectedDate: [null, Validators.required],
      Services: [[], Validators.required],
      Timeslots: [[], Validators.required],
      Note: [''],
      Uid: [''],
    });
  }

  private setupFormSubscriptions(): void {
    this.appointmentForm
      .get('SelectedDate')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((date: Date | null) => {
        this.onDateChange();
      });
    this.appointmentForm
      .get('Services')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((services: string[]) => {
        this.onServiceChange();
      });
  }

  async loadSchedules(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.scheduleService.getSchedules();
      if (response.status === 200 && Array.isArray(response.body)) {
        this.scheduledAppointments =
          response.body.map((schedule) => ({
            Id: schedule.Id,
            ContactName: schedule.ContactName,
            SelectedDate: schedule.SelectedDate,
            Services: schedule.Services,
            Timeslots: schedule.Timeslots,
            Uid: schedule.Uid,
            Note: schedule.Note,
          })) || [];
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      this.showToast('Error loading existing schedules', 'error');
    } finally {
      this.loading = false;
    }
  }

  async loadAvailableDates(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.availabilityService.getAvailableDates();
      if (response.status === 200 && Array.isArray(response.body)) {
        this.availableDates = response.body || [];
        if (this.availableDates.length == 0) {
          this.availableDates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return date;
          });
        }
      }
    } catch (error) {
      console.error('Error loading availabilities:', error);
      this.showToast('Error loading existing availabilities', 'error');
    } finally {
      this.loading = false;
    }
  }

  async loadServices(date?: Date): Promise<void> {
    try {
      if (!date) {
        this.availableServices = [];
        return;
      }
      const response =
        await this.availabilityService.getAvailableServicesByDate(
          this.formatDateToYMD(new Date(date))
        );
      if (response.status === 200 && Array.isArray(response.body)) {
        this.availableServices = response.body;
        if (this.availableServices.length === 0) {
          this.availableServices = [
            'Build Your Website',
            'Learn UI Automation',
            'AI Agents',
          ];
        }
      }
    } catch (error) {
      console.error('Error loading services:', error);
      this.showToast('Error loading available services for date', 'error');
    }
  }

  async loadTimeSlots(date: Date, services: string[]): Promise<void> {
    if (!date || !services || services.length === 0) {
      this.availableTimeSlots = [];
      return;
    }
    try {
      const response =
        await this.availabilityService.postAvailableTimeslotsByDateByServices(
          date,
          services
        );
      if (response.status === 200 && Array.isArray(response.body)) {
        this.availableTimeSlots = response.body;
      }
    } catch (error) {
        if (this.availableTimeSlots.length === 0) {
          this.availableTimeSlots = [
            '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00PM', '03:00 PM',
          ];
        }
    }
  }

  // ------------------- Form Event Handlers -------------------

  onDateChange(): void {
    const selectedDate = this.appointmentForm.get('SelectedDate')?.value;
    this.appointmentForm.get('Services')?.setValue([]);
    this.appointmentForm.get('Timeslots')?.setValue([]);
    this.loadServices(selectedDate);
  }

  onServiceChange(): void {
    const selectedDate = this.appointmentForm.get('SelectedDate')?.value;
    const selectedServices = this.appointmentForm.get('Services')?.value || [];
    this.loadTimeSlots(selectedDate, selectedServices);
  }

  // ------------------- UI Helpers -------------------
  isServiceSelected(service: string): boolean {
    if (!this.appointmentForm) return false;
    const services = this.appointmentForm.value?.Services;
    return Array.isArray(services) && services.includes(service);
  }

  isSlotSelected(slot: string): boolean {
    if (!this.appointmentForm) return false;
    const timeslots = this.appointmentForm.value?.Timeslots;
    return Array.isArray(timeslots) && timeslots.includes(slot);
  }

  toggleService(service: string): void {
    if (!this.appointmentForm) return;
    const currentServices = this.appointmentForm.value?.Services || [];
    const selected = Array.isArray(currentServices) ? [...currentServices] : [];
    const idx = selected.indexOf(service);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else {
      selected.push(service);
    }
    this.appointmentForm.get('Services')?.setValue([...selected]);
    this.appointmentForm.get('Services')?.markAsDirty();
  }

  toggleTimeslot(slot: string): void {
    if (!this.appointmentForm) return;
    const currentTimeslots = this.appointmentForm.value?.Timeslots || [];
    const selected = Array.isArray(currentTimeslots)
      ? [...currentTimeslots]
      : [];
    const idx = selected.indexOf(slot);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else {
      selected.push(slot);
    }
    this.appointmentForm.get('Timeslots')?.setValue([...selected]);
    this.appointmentForm.get('Timeslots')?.markAsDirty();
  }

  // ------------------- CRUD & Submission -------------------
  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.showToast('Please fill in all required fields correctly.', 'error');
      return;
    }
    this.loading = true;
    try {
      const formValue = this.appointmentForm.value;
      const scheduleData: Schedule = {
        ContactName: formValue.ContactName,
        SelectedDate: formValue.SelectedDate,
        Services: formValue.Services,
        Timeslots: formValue.Timeslots,
        Note: formValue.Note || '',
        Uid: formValue.Uid || this.generateUid(),
      };
      if (!this.scheduleService.validateScheduleData(scheduleData)) {
        this.showToast(
          'Please fill in all required fields correctly.',
          'error'
        );
        return;
      }
      if (this.formId === null) {
        const response = await this.scheduleService.addSchedule(scheduleData);
        if (response.status === 200 || response.status === 201) {
          this.showToast('Schedule Added Successfully!', 'success');
        } else {
          this.showToast('Error Adding Schedule', 'error');
        }
      } else {
        const existingSchedule = this.scheduledAppointments[this.formId];
        if (!existingSchedule) {
          this.showToast('Schedule not found for update.', 'error');
          return;
        }
        const response = await this.scheduleService.updateSchedule(
          existingSchedule.Uid,
          scheduleData
        );
        if (response.status === 200) {
          this.showToast('Schedule Updated Successfully!', 'success');
        } else {
          this.showToast('Error Updating Schedule', 'error');
        }
      }
      this.resetForm();
      this.loadSchedules();
    } catch (error) {
      console.error('Error adding/updating schedule:', error);
      this.showToast('Error Adding/Updating Schedule', 'error');
    } finally {
      this.loading = false;
    }
  }

  editSchedule(schedule: Schedule): void {
    const index = this.scheduledAppointments.findIndex(
      (s) => s.Uid === schedule.Uid
    );
    this.formId = index >= 0 ? index : null;
    const selectedServices = this.appointmentForm.get('Services')?.value || [];
    this.loadTimeSlots(schedule.SelectedDate, selectedServices);
    this.appointmentForm.patchValue({
      ContactName: schedule.ContactName,
      SelectedDate: schedule.SelectedDate,
      Services: schedule.Services,
      Timeslots: schedule.Timeslots,
      Note: schedule.Note,
      Uid: schedule.Uid,
    });
    if (isPlatformBrowser(this.platformId)) {
      const formElement = document.querySelector('.schedule-manager-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    this.showToast(
      'Schedule loaded for editing. Update the details and click "Update Schedule".',
      'info'
    );
    this.formbuttonText = 'Update Schedule';
  }

  async deleteSchedule(schedule: Schedule): Promise<void> {
    if (confirm(`Are you sure you want to delete this schedule?`)) {
      try {
        this.loading = true;
        const response = await this.scheduleService.deleteSchedule(
          schedule.Uid
        );
        if (response.status === 200 || response.status === 204) {
          this.showToast('Schedule deleted successfully!', 'success');
          this.loadSchedules();
        } else {
          this.showToast('Error deleting schedule', 'error');
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
        this.showToast('Error deleting schedule', 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  private resetForm(): void {
    this.appointmentForm.reset({
      ContactName: '',
      SelectedDate: null,
      Services: [],
      Timeslots: [],
      Note: '',
      Uid: '',
    });
    Object.keys(this.appointmentForm.controls).forEach((key) => {
      const control = this.appointmentForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
      control?.setErrors(null);
    });
    this.formId = null;
    this.formbuttonText = 'Add Schedule';
    this.availableTimeSlots = [];
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const ymd = this.formatDateToYMD(date);
    return this.availableDates.some(
      (d) => this.formatDateToYMD(new Date(d)) === ymd
    );
  };

  getScheduleImageUrl(schedule: Schedule): string {
    return 'assets/schedule.png';
  }

  getScheduleTitle(schedule: Schedule): string {
    return schedule.SelectedDate
      ? new Date(schedule.SelectedDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'No date';
  }

}
