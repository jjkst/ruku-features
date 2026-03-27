import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Availability } from '../models/availability.model';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class AvailabilityService extends BaseService {
  private readonly endpoint = '/availabilities';

  async getAvailabilities(): Promise<HttpResponse<any[]>> {
    return await this.get<Availability[]>(this.endpoint);
  }

  async getAvailableDates(): Promise<HttpResponse<any[]>> {
    return await this.get<Availability[]>(this.endpoint + '/dates');
  }

  async getAvailableServicesByDate(
    datestring: string
  ): Promise<HttpResponse<any[]>> {
    return await this.get<Availability[]>(
      this.endpoint + `/services?date=${datestring}`
    );
  }

  async postAvailableTimeslotsByDateByServices(
    date: Date,
    services: string[]
  ): Promise<HttpResponse<any[]>> {
    var request = {
      date: date,
      services: services,
    };
    return await this.post<any>(this.endpoint + '/timeslots', request);
  }

  async addAvailability(
    availabilityData: Availability
  ): Promise<HttpResponse<Availability>> {
    return await this.post<Availability>(this.endpoint, availabilityData);
  }

  async updateAvailability(
    id: number,
    availabilityData: Availability
  ): Promise<HttpResponse<Availability>> {
    return await this.put<Availability>(
      `${this.endpoint}/${id}`,
      availabilityData
    );
  }

  async deleteAvailability(id: number): Promise<HttpResponse<void>> {
    return await this.delete<void>(`${this.endpoint}/${id}`);
  }

  validateAvailabilityData(availability: Availability): boolean {
    const requiredFields = ['StartDate', 'EndDate', 'Timeslots'];
    return this.validateRequiredFields(availability, requiredFields);
  }
}
