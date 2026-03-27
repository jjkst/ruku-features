import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Schedule } from '../models/schedule.model';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService extends BaseService {
  private readonly endpoint = '/schedules';

  async getSchedules(): Promise<HttpResponse<any[]>> {
    return await this.get<Schedule[]>(this.endpoint);
  }

  async addSchedule(scheduleData: Schedule): Promise<HttpResponse<Schedule>> {
    return await this.post<Schedule>(this.endpoint, scheduleData);
  }

  async updateSchedule(id: string, scheduleData: Schedule): Promise<HttpResponse<Schedule>> {
    return await this.put<Schedule>(`${this.endpoint}/${id}`, scheduleData);
  }

  async deleteSchedule(id: string): Promise<HttpResponse<void>> {
    return await this.delete<void>(`${this.endpoint}/${id}`);
  }

  validateScheduleData(schedule: Schedule): boolean {
    const requiredFields = ['ContactName', 'SelectedDate', 'Services', 'Timeslots'];
    return this.validateRequiredFields(schedule, requiredFields);
  }
}
