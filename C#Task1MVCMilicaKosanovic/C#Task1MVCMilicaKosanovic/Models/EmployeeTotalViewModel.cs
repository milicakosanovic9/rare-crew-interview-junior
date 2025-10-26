namespace C_Task1MVCMilicaKosanovic.Models
{
    public class EmployeeTotalViewModel
    {
        public List<EmployeeSummary> Employees { get; set; }
    }
    public class EmployeeSummary
    {
        public string Name { get; set; }
        public double TotalHours { get; set; }
        public bool IsLowHours => TotalHours < 100;
    }
}
