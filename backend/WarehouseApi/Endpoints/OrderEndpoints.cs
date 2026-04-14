using Microsoft.EntityFrameworkCore;
using WarehouseApi.Data;
using WarehouseApi.DTOs;
using WarehouseApi.Models;

namespace WarehouseApi.Endpoints;

public static class OrderEndpoints
{
    public static RouteGroupBuilder MapOrders(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetAll);
        group.MapGet("/{id:int}", GetById);
        group.MapPost("/", Create);
        group.MapPut("/{id:int}", Update);
        group.MapDelete("/{id:int}", Delete);
        group.MapPost("/{id:int}/confirm", Confirm);
        group.MapPost("/{id:int}/complete", Complete);
        group.MapPost("/{id:int}/items", AddItem);
        group.MapPut("/{id:int}/items/{itemId:int}", UpdateItem);
        group.MapDelete("/{id:int}/items/{itemId:int}", DeleteItem);
        return group;
    }

    static async Task<IResult> GetAll(AppDbContext db, string? type = null, string? status = null)
    {
        var query = db.Orders.Include(o => o.Items).AsQueryable();

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<OrderType>(type, true, out var orderType))
            query = query.Where(o => o.Type == orderType);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
            query = query.Where(o => o.Status == orderStatus);

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();

        return Results.Ok(orders.Select(o => new OrderListItem(
            o.Id, o.Type.ToString(), o.Status.ToString(), o.Notes, o.CreatedAt, o.Items.Count)));
    }

    static async Task<IResult> GetById(int id, AppDbContext db)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return Results.NotFound();
        return Results.Ok(ToResponse(order));
    }

    static async Task<IResult> Create(OrderRequest req, AppDbContext db)
    {
        var order = new Order { Type = req.Type, Notes = req.Notes };
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return Results.Created($"/orders/{order.Id}", ToResponse(order));
    }

    static async Task<IResult> Update(int id, OrderRequest req, AppDbContext db)
    {
        var order = await db.Orders.FindAsync(id);
        if (order is null) return Results.NotFound();
        if (order.Status != OrderStatus.Draft) return Results.BadRequest("Only Draft orders can be edited.");

        order.Notes = req.Notes;
        await db.SaveChangesAsync();

        var full = await db.Orders.Include(o => o.Items).ThenInclude(oi => oi.Product)
            .FirstAsync(o => o.Id == id);
        return Results.Ok(ToResponse(full));
    }

    static async Task<IResult> Delete(int id, AppDbContext db)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null) return Results.NotFound();
        if (order.Status != OrderStatus.Draft) return Results.BadRequest("Only Draft orders can be deleted.");

        db.Orders.Remove(order);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    static async Task<IResult> Confirm(int id, AppDbContext db)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null) return Results.NotFound();
        if (order.Status != OrderStatus.Draft) return Results.BadRequest("Only Draft orders can be confirmed.");
        if (!order.Items.Any()) return Results.BadRequest("Cannot confirm an order with no items.");

        order.Status = OrderStatus.Confirmed;
        await db.SaveChangesAsync();
        return Results.Ok(ToResponse(order));
    }

    static async Task<IResult> Complete(int id, AppDbContext db)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return Results.NotFound();
        if (order.Status != OrderStatus.Confirmed) return Results.BadRequest("Only Confirmed orders can be completed.");

        if (order.Type == OrderType.Outgoing)
        {
            foreach (var item in order.Items)
            {
                var stock = await CalculateStock(db, item.ProductId);
                if (stock < item.Quantity)
                    return Results.BadRequest($"Insufficient stock for '{item.Product.Name}'. Available: {stock}, required: {item.Quantity}.");
            }
        }

        order.Status = OrderStatus.Completed;
        order.CompletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Results.Ok(ToResponse(order));
    }

    static async Task<IResult> AddItem(int id, OrderItemRequest req, AppDbContext db)
    {
        var order = await db.Orders.FindAsync(id);
        if (order is null) return Results.NotFound();
        if (order.Status != OrderStatus.Draft) return Results.BadRequest("Items can only be added to Draft orders.");

        if (req.Quantity <= 0) return Results.BadRequest("Quantity must be greater than 0.");

        var product = await db.Products.FindAsync(req.ProductId);
        if (product is null) return Results.BadRequest("Product not found.");

        var item = new OrderItem
        {
            OrderId = id,
            ProductId = req.ProductId,
            Quantity = req.Quantity,
            UnitPrice = req.UnitPrice
        };

        db.OrderItems.Add(item);
        await db.SaveChangesAsync();

        await db.Entry(item).Reference(i => i.Product).LoadAsync();
        return Results.Created($"/orders/{id}/items/{item.Id}", ToItemResponse(item));
    }

    static async Task<IResult> UpdateItem(int id, int itemId, OrderItemRequest req, AppDbContext db)
    {
        var order = await db.Orders.FindAsync(id);
        if (order is null) return Results.NotFound();
        if (order.Status != OrderStatus.Draft) return Results.BadRequest("Items can only be edited in Draft orders.");

        var item = await db.OrderItems.Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.OrderId == id);
        if (item is null) return Results.NotFound();

        if (req.Quantity <= 0) return Results.BadRequest("Quantity must be greater than 0.");

        item.Quantity = req.Quantity;
        item.UnitPrice = req.UnitPrice;
        await db.SaveChangesAsync();
        return Results.Ok(ToItemResponse(item));
    }

    static async Task<IResult> DeleteItem(int id, int itemId, AppDbContext db)
    {
        var order = await db.Orders.FindAsync(id);
        if (order is null) return Results.NotFound();
        if (order.Status != OrderStatus.Draft) return Results.BadRequest("Items can only be removed from Draft orders.");

        var item = await db.OrderItems.FirstOrDefaultAsync(i => i.Id == itemId && i.OrderId == id);
        if (item is null) return Results.NotFound();

        db.OrderItems.Remove(item);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    static async Task<int> CalculateStock(AppDbContext db, int productId)
    {
        var incoming = await db.OrderItems
            .Where(oi => oi.ProductId == productId && oi.Order.Status == OrderStatus.Completed && oi.Order.Type == OrderType.Incoming)
            .SumAsync(oi => (int?)oi.Quantity) ?? 0;

        var outgoing = await db.OrderItems
            .Where(oi => oi.ProductId == productId && oi.Order.Status == OrderStatus.Completed && oi.Order.Type == OrderType.Outgoing)
            .SumAsync(oi => (int?)oi.Quantity) ?? 0;

        return incoming - outgoing;
    }

    static OrderResponse ToResponse(Order o) => new(
        o.Id, o.Type.ToString(), o.Status.ToString(), o.Notes, o.CreatedAt, o.CompletedAt,
        o.Items.Select(ToItemResponse).ToList()
    );

    static OrderItemResponse ToItemResponse(OrderItem oi) => new(
        oi.Id, oi.ProductId, oi.Product?.Name ?? "", oi.Product?.SKU ?? "",
        oi.Quantity, oi.UnitPrice, oi.Quantity * oi.UnitPrice
    );
}
