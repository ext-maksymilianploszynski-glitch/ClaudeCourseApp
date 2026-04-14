using WarehouseApi.Models;

namespace WarehouseApi.DTOs;

public record OrderRequest(
    OrderType Type,
    string? Notes
);

public record OrderItemRequest(
    int ProductId,
    int Quantity,
    decimal UnitPrice
);

public record OrderItemResponse(
    int Id,
    int ProductId,
    string ProductName,
    string ProductSKU,
    int Quantity,
    decimal UnitPrice,
    decimal Subtotal
);

public record OrderResponse(
    int Id,
    string Type,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    List<OrderItemResponse> Items
);

public record OrderListItem(
    int Id,
    string Type,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    int ItemCount
);
