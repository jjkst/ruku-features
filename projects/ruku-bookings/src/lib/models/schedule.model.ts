export interface Schedule {
    Id?: number;
    ContactName: string;
    SelectedDate: Date;
    Services: string[];
    Timeslots: string[];
    Note?: string;
    Uid: string;
}
