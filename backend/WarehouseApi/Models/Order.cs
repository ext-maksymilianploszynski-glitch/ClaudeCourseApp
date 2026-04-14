namespace WarehouseApi.Models;

public enum OrderType { Incoming, Outgoing }
public enum OrderStatus { Draft, Confirmed, Completed }

public class Order
{
    public int Id { get; set; }
    public OrderType Type { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
