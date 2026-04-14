using Microsoft.EntityFrameworkCore;
using WarehouseApi.Data;
using WarehouseApi.DTOs;
using WarehouseApi.Models;

namespace WarehouseApi.Endpoints;

public static class ProductEndpoints
{
    public static RouteGroupBuilder MapProducts(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetAll);
        group.MapGet("/{id:int}", GetById);
        group.MapPost("/", Create);
        group.MapPut("/{id:int}", Update);
        group.MapDelete("/{id:int}", Delete);
        return group;
    }

    static async Task<IResult> GetAll(AppDbContext db)
    {
        var products = await db.Products.ToListAsync();
        var stockMap = await GetStockMap(db);

        var result = products.Select(p =>
        {
            var stock = stockMap.GetValueOrDefault(p.Id, 0);
            return ToResponse(p, stock);
        });

        return Results.Ok(result);
    }

    static async Task<IResult> GetById(int id, AppDbContext db)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return Results.NotFound();

        var stock = await CalculateStock(db, id);
        return Results.Ok(ToResponse(product, stock));
    }

    static async Task<IResult> Create(ProductRequest req, AppDbContext db)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.SKU))
            return Results.BadRequest("Name and SKU are required.");

        if (await db.Products.AnyAsync(p => p.SKU == req.SKU))
            return Results.Conflict("SKU already exists.");

        var product = new Product
        {
            Name = req.Name,
            SKU = req.SKU,
            Category = req.Category,
            Unit = req.Unit,
            Price = req.Price,
            LowStockThreshold = req.LowStockThreshold
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();
        return Results.Created($"/products/{product.Id}", ToResponse(product, 0));
    }

    static async Task<IResult> Update(int id, ProductRequest req, AppDbContext db)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return Results.NotFound();

        if (await db.Products.AnyAsync(p => p.SKU == req.SKU && p.Id != id))
            return Results.Conflict("SKU already exists.");

        product.Name = req.Name;
        product.SKU = req.SKU;
        product.Category = req.Category;
        product.Unit = req.Unit;
        product.Price = req.Price;
        product.LowStockThreshold = req.LowStockThreshold;

        await db.SaveChangesAsync();

        var stock = await CalculateStock(db, id);
        return Results.Ok(ToResponse(product, stock));
    }

    static async Task<IResult> Delete(int id, AppDbContext db)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return Results.NotFound();

        if (await db.OrderItems.AnyAsync(oi => oi.ProductId == id))
            return Results.BadRequest("Cannot delete product with existing orders.");

        db.Products.Remove(product);
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

    static async Task<Dictionary<int, int>> GetStockMap(AppDbContext db)
    {
        var incoming = await db.OrderItems
            .Where(oi => oi.Order.Status == OrderStatus.Completed && oi.Order.Type == OrderType.Incoming)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new { g.Key, Total = g.Sum(x => x.Quantity) })
            .ToDictionaryAsync(x => x.Key, x => x.Total);

        var outgoing = await db.OrderItems
            .Where(oi => oi.Order.Status == OrderStatus.Completed && oi.Order.Type == OrderType.Outgoing)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new { g.Key, Total = g.Sum(x => x.Quantity) })
            .ToDictionaryAsync(x => x.Key, x => x.Total);

        var allIds = incoming.Keys.Union(outgoing.Keys);
        return allIds.ToDictionary(id => id, id =>
            incoming.GetValueOrDefault(id, 0) - outgoing.GetValueOrDefault(id, 0));
    }

    static ProductResponse ToResponse(Product p, int stock) => new(
        p.Id, p.Name, p.SKU, p.Category, p.Unit, p.Price,
        p.LowStockThreshold, stock, stock <= p.LowStockThreshold, p.CreatedAt
    );
}
