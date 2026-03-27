import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Availability } from '../../models/availability.model';
import { Service } from '../../models/service.model';
import { ProductService } from '../../services/product.service';
import { AvailabilityService } from '../../services/availability.service';
import { HorizontalCardListComponent } from '../horizontal-card-list/horizontal-card-list.component';
import { MaterialModule } from '../../shared/material.module';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'app-availability-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    HorizontalCardListComponent
  ],
  templateUrl: './availability-manager.component.html',
  styleUrls: ['./availability-manager.component.scss'],
})
export class AvailabilityManagerComponent extends BaseComponent implements OnInit {
  availabilityForm!: FormGroup;

  availabilities: Availability[] = [];
  formId = 0;
  formbuttonText = 'Add Availability';

  allTimeslots: string[] = [];
  allServices: Service[] = [];

  constructor(
    private fb: FormBuilder,
    private availabilityService: AvailabilityService,
    private productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
  }

  ngOnInit(): void {
    this.allTimeslots = this.generateTimeslots('07:00', '19:00');
    this.availabilityForm = this.fb.group({
      StartDate: [null, Validators.required],
      EndDate: [null, Validators.required],
      Timeslots: [[], Validators.required],
      Services: [[], Validators.required],
    });
    this.loadAvailabilities();
    this.loadServices();
  }



  generateTimeslots(start: string, end: string): string[] {
    const slots: string[] = [];
    let [hour, min] = start.split(':').map(Number);
    const [endHour] = end.split(':').map(Number);
    while (hour < endHour) {
      const from = this.formatTime(hour);
      const to = this.formatTime(hour + 1);
      slots.push(`${from} - ${to}`);
      hour++;
    }
    return slots;
  }

  formatTime(hour: number): string {
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${ampm}`;
  }

  isSelected(slot: string): boolean {
    if (!this.availabilityForm) return false;
    const timeslots = this.availabilityForm.value?.Timeslots;
    return Array.isArray(timeslots) && timeslots.includes(slot);
  }

  isServiceSelected(service: string): boolean {
    if (!this.availabilityForm) return false;
    const services = this.availabilityForm.value?.Services;
    return Array.isArray(services) && services.includes(service);
  }

  toggleTimeslot(slot: string): void {
    if (!this.availabilityForm) return;
    const currentTimeslots = this.availabilityForm.value?.Timeslots || [];
    const selected = Array.isArray(currentTimeslots) ? [...currentTimeslots] : [];
    const idx = selected.indexOf(slot);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else {
      selected.push(slot);
    }
    this.availabilityForm.get('Timeslots')?.setValue([...selected]);
    this.availabilityForm.get('Timeslots')?.markAsDirty();
  }

  toggleService(service: string): void {
    if (!this.availabilityForm) return;
    const currentServices = this.availabilityForm.value?.Services || [];
    const selected = Array.isArray(currentServices) ? [...currentServices] : [];
    const idx = selected.indexOf(service);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else {
      selected.push(service);
    }
    this.availabilityForm.get('Services')?.setValue([...selected]);
    this.availabilityForm.get('Services')?.markAsDirty();
  }

  async onSubmit(): Promise<void> {
    if (this.availabilityForm.valid) {
      this.loading = true;

      const formValue = this.availabilityForm.value;
      const addUpdateAvailability: Availability = {
        Id: this.formId,
        StartDate: formValue.StartDate,
        EndDate: formValue.EndDate,
        Timeslots: formValue.Timeslots.map((s: string) => s.trim()),
        Services: formValue.Services,
      };

      if (addUpdateAvailability.StartDate >= addUpdateAvailability.EndDate) {
        this.showToast('End date must be after start date', 'error');
        this.loading = false;
        return;
      }

      if (
        !this.availabilityService.validateAvailabilityData(
          addUpdateAvailability
        )
      ) {
        this.showToast(
          'Please fill in all required fields correctly.',
          'error'
        );
        this.loading = false;
        return;
      }

      try {
        console.log('formId', this.formId);
        console.log('addUpdateAvailability', addUpdateAvailability);
        const response =
          this.formId === 0
            ? await this.availabilityService.addAvailability(
                addUpdateAvailability
              )
            : await this.availabilityService.updateAvailability(
                addUpdateAvailability?.Id ?? 0,
                addUpdateAvailability
              );

        console.log('response', response);
        if (response.status === 200 || response.status === 201) {
          this.showToast('Availability Added/Updated Successfully!', 'success');
          this.resetForm();
          this.loadAvailabilities();
        } else if (response.status === 409) {
          this.showToast('Availability Dates collide with existing availability.', 'error');
        } else {
          this.showToast('Error Adding Availability', 'error');
          console.error('Error Adding Availability:', response);
        }
      } catch (error: any) {
        this.showToast('Error Adding Availability', 'error');
        console.error('Error adding Availability:', error);
      } finally {
        this.loading = false;
      }
    } else {
      this.availabilityForm.markAllAsTouched();
      this.showToast('Please fill in all required fields correctly.', 'error');
    }
  }

  private async loadAvailabilities(): Promise<void> {
    try {
      const response = await this.availabilityService.getAvailabilities();
      if (response.status === 200 && Array.isArray(response.body)) {
        this.availabilities =
          response.body.map((availability) => ({
            Id: availability.Id,
            StartDate: availability.StartDate,
            EndDate: availability.EndDate,
            Timeslots: availability.Timeslots,
            Services: availability.Services,
          })) || [];
      }
    } catch (error) {
      console.error('Error loading availabilities:', error);
      this.showToast('Error loading existing availabilities', 'error');
    }
  }

  editAvailability(availability: Availability): void {
    this.formId = availability.Id ?? 0;
    this.availabilityForm.patchValue({
      StartDate: availability.StartDate,
      EndDate: availability.EndDate,
      Timeslots: availability.Timeslots,
      Services: availability.Services,
    });

    // Scroll to the form section
    if (isPlatformBrowser(this.platformId)) {
      const formElement = document.querySelector('.availability-manager-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }

    this.showToast(
      'Availability loaded for editing. Update the details and click "Update Availability".',
      'info'
    );
    this.formbuttonText = 'Update Availability';
  }

  async deleteAvailability(availability: Availability): Promise<void> {
    if (confirm(`Are you sure you want to delete this availability?`)) {
      try {
        this.loading = true;
        const response = await this.availabilityService.deleteAvailability(
          availability.Id ?? 0
        );
        if (response.status === 200 || response.status === 204) {
          this.showToast('Availability deleted successfully!', 'success');
          await this.loadAvailabilities();
        } else {
          this.showToast('Error deleting availability', 'error');
        }
      } catch (error) {
        console.error('Error deleting availability:', error);
        this.showToast('Error deleting availability', 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  private resetForm(): void {
    // Reset form with empty values and clear validation state
    this.availabilityForm.reset({
      StartDate: null,
      EndDate: null,
      Timeslots: [],
      Services: [],
    });

    this.formId = 0;
    this.formbuttonText = 'Add Availability';
  }



  getAvailabilityImageUrl(availability: Availability): string {
    return 'assets/ruku-logo.png';
  }

  getAvailabilityTitle(availability: Availability): string {
    const startDate = availability.StartDate
      ? new Date(availability.StartDate).toLocaleDateString()
      : 'No start date';
    const endDate = availability.EndDate
      ? new Date(availability.EndDate).toLocaleDateString()
      : 'No end date';
    return `${startDate} - ${endDate}`;
  }

  private async loadServices(): Promise<void> {
    try {
      const response = await this.productService.getServices();
      if (response.status === 200 && Array.isArray(response.body)) {
        this.allServices =
          response.body.map((service) => ({
            Id: service.Id,
            Title: service.Title,
            Description: service.Description,
            FileName: service.FileName,
          })) || [];
      }
    } catch (error) {
      console.error('Error loading services:', error);
      this.showToast('Error loading existing services', 'error');
    }
  }
}
