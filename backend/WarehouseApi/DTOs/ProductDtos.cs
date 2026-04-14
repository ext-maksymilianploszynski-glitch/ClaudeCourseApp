namespace WarehouseApi.DTOs;

public record ProductRequest(
    string Name,
    string SKU,
    string? Category,
    string Unit,
    decimal? Price,
    int LowStockThreshold
);

public record ProductResponse(
    int Id,
    string Name,
    string SKU,
    string? Category,
    string Unit,
    decimal? Price,
    int LowStockThreshold,
    int CurrentStock,
    bool IsLowStock,
    DateTime CreatedAt
);
