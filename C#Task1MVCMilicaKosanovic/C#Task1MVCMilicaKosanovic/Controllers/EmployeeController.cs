using Microsoft.AspNetCore.Mvc;
using C_Task1MVCMilicaKosanovic.Models;
using Newtonsoft.Json;
using System.Net.Http;
using ScottPlot;

namespace C_Task1MVCMilicaKosanovic.Controllers
{
    public class EmployeeController : Controller
    {
        private readonly string _apiKey = "vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==";
        private readonly string _apiUrl;

        public EmployeeController()
        {
            _apiUrl = $"https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code={_apiKey}";
        }

        public async Task<IActionResult> Index()
        {
            var viewModel = new EmployeeTotalViewModel
            {
                Employees = await GetEmployeeSummary()
            };

                return View(viewModel);
        }
        public async Task<IActionResult> GeneratePieChart()
        {
            try
            {
                byte[] imageBytes = await GeneratePieChartImage();
                return File(imageBytes, "image/png", "employee_pie_chart.png");
            }
            catch (Exception ex)
            {
                return Content($"Error: {ex.Message}");
            }
        }

        public async Task<IActionResult> GetPieChartImage()
        {
            try
            {
                byte[] imageBytes = await GeneratePieChartImage();
                return File(imageBytes, "image/png");
            }
            catch (Exception ex)
            {
                return Content($"Error: {ex.Message}");
            }
        }

        private async Task<List<EmployeeSummary>> GetEmployeeSummary()
        {
            try
            {
                using var httpClient = new HttpClient();
                var response = await httpClient.GetAsync(_apiUrl);
                response.EnsureSuccessStatusCode();

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var timeEntries = JsonConvert.DeserializeObject<List<EmployeeTimeEntry>>(jsonResponse);

                var entriesWithName = timeEntries.Where(e => e.EmployeeName != null).ToList();
                var activeEntries = entriesWithName.Where(e => e.DeletedOn == null).ToList();

                var employeeTotal = activeEntries
                    .GroupBy(e => e.EmployeeName)
                    .Select(g => new EmployeeSummary
                    {
                        Name = g.Key,
                        TotalHours = g.Sum(e => Math.Abs((e.EndTimeUtc - e.StartTimeUtc).TotalHours))
                    })
                    .OrderByDescending(e => e.TotalHours)
                    .ToList();

                return employeeTotal;
            }
            catch (Exception ex)
            {
                ViewBag.Error = ex.Message;
                return new List<EmployeeSummary>();
            }
        }

        private async Task<byte[]>GeneratePieChartImage()
        {
            var employeesTotal = await GetEmployeeSummary();

            var plt = new ScottPlot.Plot(800, 600);

            double[] values = employeesTotal.Select(e => e.TotalHours).ToArray();
            string[] labels = employeesTotal.Select(e => e.Name).ToArray();

            var pie = plt.AddPie(values);
            pie.SliceLabels = labels;
            pie.ShowPercentages = true;
            pie.ShowValues = false;
            pie.ShowLabels = true;

            plt.Title("Employee Time Distribution");
            plt.Legend();

            var bitmap = plt.Render();

            using var ms = new System.IO.MemoryStream();
            bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
            return ms.ToArray();
        }
    }
}
