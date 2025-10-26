using Newtonsoft.Json;
using System;
using System.Text.Json;

namespace C_Task1MVCMilicaKosanovic.Models

{
    public class EmployeeTimeEntry
    {
        public string Id { get; set; }
        public string EmployeeName { get; set; }
        [JsonProperty("StarTimeUtc")]
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set;}
        public string EntryNotes { get; set; }
        public DateTime? DeletedOn {  get; set; }

    }
}
