import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimeEntry } from '../models/time-entry';
import { EmployeeSummary } from '../models/employee-summary';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==';

  constructor(private http: HttpClient) { }

  getEmployeeSummary(): Observable<EmployeeSummary[]> {
    return this.http.get<TimeEntry[]>(this.apiUrl).pipe(
      map(entries => {
        const activeEntries = entries.filter(e => e.DeletedOn === null && e.EmployeeName);

        const grouped = activeEntries.reduce((acc, entry) => {
          const name = entry.EmployeeName;
          const start = new Date(entry.StarTimeUtc);
          const end = new Date(entry.EndTimeUtc);
          const hours = Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60));

          if (!acc[name]) {
            acc[name] = 0;
          }
          acc[name] += hours;

          return acc;
        }, {} as { [key: string]: number });

        const summary: EmployeeSummary[] = Object.keys(grouped).map(name => ({
          name: name,
          totalHours: grouped[name],
          isLowHours: grouped[name] < 100
        })).sort((a, b) => b.totalHours - a.totalHours);

        return summary;
      })
    );
  }
}
