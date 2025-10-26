import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { EmployeeService } from './services/employee.service';
import { EmployeeSummary } from './models/employee-summary';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Employee Time Report';
  employees: EmployeeSummary[] = [];
  loading = true;
  error: string | null = null;

  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    if (!this.loading && this.employees.length > 0) {
      setTimeout(() => this.createChart(), 100);
    }
  }

  loadEmployees(): void {
    this.employeeService.getEmployeeSummary().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
        setTimeout(() => this.createChart(), 100);
      },
      error: (err) => {
        this.error = 'Failed to load employee data';
        this.loading = false;
        console.error(err);
      }
    });
  }

  createChart(): void {
    if (!this.pieChartRef || !this.pieChartRef.nativeElement) {
      console.log('Canvas element not ready yet, will retry...');
      setTimeout(() => this.createChart(), 200);
      return;
    }

    if (!this.employees || this.employees.length === 0) {
      console.log('No employee data yet');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = this.pieChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Cannot get canvas context!');
      return;
    }

    console.log('Creating chart with employees:', this.employees);

    const labels = this.employees.map(e => e.name);
    const data = this.employees.map(e => e.totalHours);
    const total = data.reduce((a, b) => a + b, 0);

    console.log('Chart data:', { labels, data });

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Hours Worked',
          data: data,
          backgroundColor: [
            '#CD7F32',
            '#FFE66D',
            '#9B59B6',
            '#B39DDB',
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Time Distribution by Employee'
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage = ((value / total) * 100).toFixed(0);
                return `${label}: ${value.toFixed(0)} hrs (${percentage}%)`;
              }
            }
          }
        }
      },
      plugins: [{
        id: 'percentageLabels',
        afterDatasetsDraw: (chart: any) => {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            if (!meta.hidden) {
              meta.data.forEach((element: any, index: number) => {
                const data = dataset.data[index];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((data / total) * 100).toFixed(0) + '%';

                const { x, y } = element.tooltipPosition();

                ctx.save();
                ctx.fillStyle = 'white';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(percentage, x, y);
                ctx.restore();
              });
            }
          });
        }
      }]
    });

    console.log('Chart created successfully!');
  }
}
