using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientAddressService
{
    private readonly AskTransportDbContext _db;

    public ClientAddressService(
        AskTransportDbContext db)
    {
        _db = db;
    }


    public async Task<List<ClientAddressDto>> GetMyAddressesAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        return await _db.ClientAddresses
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.CreatedAt)
            .Select(x => new ClientAddressDto
            {
                Id = x.Id,
                AddressType = x.AddressType,
                ContactName = x.ContactName,
                PhoneNumber = x.PhoneNumber,
                AddressLine1 = x.AddressLine1,
                AddressLine2 = x.AddressLine2,
                City = x.City,
                State = x.State,
                PostalCode = x.PostalCode,
                Country = x.Country,
                IsDefault = x.IsDefault
            })
            .ToListAsync(cancellationToken);
    }


    public async Task<ClientAddressDto?> GetAddressAsync(
        int userId,
        int addressId,
        CancellationToken cancellationToken = default)
    {
        return await _db.ClientAddresses
            .AsNoTracking()
            .Where(x =>
                x.Id == addressId &&
                x.UserId == userId)
            .Select(x => new ClientAddressDto
            {
                Id = x.Id,
                AddressType = x.AddressType,
                ContactName = x.ContactName,
                PhoneNumber = x.PhoneNumber,
                AddressLine1 = x.AddressLine1,
                AddressLine2 = x.AddressLine2,
                City = x.City,
                State = x.State,
                PostalCode = x.PostalCode,
                Country = x.Country,
                IsDefault = x.IsDefault
            })
            .FirstOrDefaultAsync(cancellationToken);
    }


    public async Task<ClientAddressDto> CreateAsync(
        int userId,
        SaveClientAddressRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.IsDefault)
        {
            await RemoveExistingDefaultAsync(
                userId,
                request.AddressType,
                cancellationToken);
        }


        var address = new ClientAddress
        {
            UserId = userId,

            AddressType =
                request.AddressType.Trim(),

            ContactName =
                request.ContactName.Trim(),

            PhoneNumber =
                request.PhoneNumber.Trim(),

            AddressLine1 =
                request.AddressLine1.Trim(),

            AddressLine2 =
                Clean(request.AddressLine2),

            City =
                request.City.Trim(),

            State =
                request.State.Trim(),

            PostalCode =
                request.PostalCode.Trim(),

            Country =
                request.Country.Trim(),

            IsDefault =
                request.IsDefault,

            CreatedAt =
                DateTime.UtcNow
        };


        _db.ClientAddresses.Add(address);

        await _db.SaveChangesAsync(cancellationToken);


        return Map(address);
    }


    public async Task<ClientAddressDto?> UpdateAsync(
        int userId,
        int addressId,
        SaveClientAddressRequest request,
        CancellationToken cancellationToken = default)
    {
        var address =
            await _db.ClientAddresses
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == addressId &&
                        x.UserId == userId,
                    cancellationToken);


        if (address == null)
        {
            return null;
        }


        if (request.IsDefault)
        {
            await RemoveExistingDefaultAsync(
                userId,
                request.AddressType,
                cancellationToken,
                address.Id);
        }


        address.AddressType =
            request.AddressType.Trim();

        address.ContactName =
            request.ContactName.Trim();

        address.PhoneNumber =
            request.PhoneNumber.Trim();

        address.AddressLine1 =
            request.AddressLine1.Trim();

        address.AddressLine2 =
            Clean(request.AddressLine2);

        address.City =
            request.City.Trim();

        address.State =
            request.State.Trim();

        address.PostalCode =
            request.PostalCode.Trim();

        address.Country =
            request.Country.Trim();

        address.IsDefault =
            request.IsDefault;

        address.UpdatedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync(cancellationToken);

        return Map(address);
    }


    public async Task<bool> SetDefaultAsync(
        int userId,
        int addressId,
        CancellationToken cancellationToken = default)
    {
        var address =
            await _db.ClientAddresses
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == addressId &&
                        x.UserId == userId,
                    cancellationToken);


        if (address == null)
        {
            return false;
        }


        await RemoveExistingDefaultAsync(
            userId,
            address.AddressType,
            cancellationToken,
            address.Id);


        address.IsDefault = true;

        address.UpdatedAt = DateTime.UtcNow;


        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }


    public async Task<bool> DeleteAsync(
        int userId,
        int addressId,
        CancellationToken cancellationToken = default)
    {
        var address =
            await _db.ClientAddresses
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == addressId &&
                        x.UserId == userId,
                    cancellationToken);


        if (address == null)
        {
            return false;
        }


        _db.ClientAddresses.Remove(address);

        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }


    private async Task RemoveExistingDefaultAsync(
        int userId,
        string addressType,
        CancellationToken cancellationToken,
        int? exceptId = null)
    {
        var query =
            _db.ClientAddresses.Where(x =>
                x.UserId == userId &&
                x.AddressType == addressType &&
                x.IsDefault);


        if (exceptId.HasValue)
        {
            query = query.Where(x =>
                x.Id != exceptId.Value);
        }


        var addresses =
            await query.ToListAsync(cancellationToken);


        foreach (var address in addresses)
        {
            address.IsDefault = false;
            address.UpdatedAt = DateTime.UtcNow;
        }
    }


    private static ClientAddressDto Map(
        ClientAddress address)
    {
        return new ClientAddressDto
        {
            Id = address.Id,
            AddressType = address.AddressType,
            ContactName = address.ContactName,
            PhoneNumber = address.PhoneNumber,
            AddressLine1 = address.AddressLine1,
            AddressLine2 = address.AddressLine2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country,
            IsDefault = address.IsDefault
        };
    }


    private static string? Clean(
        string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}