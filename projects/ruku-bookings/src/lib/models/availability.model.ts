export interface Availability {
    Id?: number;
    StartDate: Date;
    EndDate: Date;
    Timeslots: string[];
    Services: string[];
}
