using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientContactService
{
    private readonly AskTransportDbContext _db;

    public ClientContactService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<List<SavedContactDto>>
        GetAllAsync(
            int userId,
            string? type,
            string? search,
            CancellationToken cancellationToken)
    {
        var query =
            _db.SavedContacts
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId);

        if (!string.IsNullOrWhiteSpace(type))
        {
            query =
                query.Where(x =>
                    x.ContactType == type);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var value = search.Trim();

            query =
                query.Where(x =>
                    x.Name.Contains(value) ||
                    x.Phone.Contains(value) ||
                    x.City.Contains(value));
        }

        return await query
            .OrderByDescending(x =>
                x.IsDefault)
            .ThenBy(x =>
                x.Name)
            .Select(x =>
                new SavedContactDto
                {
                    Id = x.Id,
                    ContactType =
                        x.ContactType,
                    Name = x.Name,
                    Phone = x.Phone,
                    Email = x.Email,
                    Address = x.Address,
                    City = x.City,
                    State = x.State,
                    PinCode = x.PinCode,
                    IsDefault =
                        x.IsDefault,
                    CreatedAt =
                        x.CreatedAt
                })
            .ToListAsync(
                cancellationToken);
    }

    public async Task<SavedContactDto?>
        GetAsync(
            int userId,
            int id,
            CancellationToken cancellationToken)
    {
        return await _db.SavedContacts
            .AsNoTracking()
            .Where(x =>
                x.Id == id &&
                x.UserId == userId)
            .Select(x =>
                new SavedContactDto
                {
                    Id = x.Id,
                    ContactType =
                        x.ContactType,
                    Name = x.Name,
                    Phone = x.Phone,
                    Email = x.Email,
                    Address = x.Address,
                    City = x.City,
                    State = x.State,
                    PinCode = x.PinCode,
                    IsDefault =
                        x.IsDefault,
                    CreatedAt =
                        x.CreatedAt
                })
            .FirstOrDefaultAsync(
                cancellationToken);
    }

    public async Task<SavedContactDto>
        CreateAsync(
            int userId,
            SaveContactRequest request,
            CancellationToken cancellationToken)
    {
        var type =
            NormalizeType(
                request.ContactType);

        if (request.IsDefault)
        {
            await RemoveOldDefaultAsync(
                userId,
                type,
                null,
                cancellationToken);
        }

        var contact =
            new SavedContact
            {
                UserId = userId,
                ContactType = type,
                Name = request.Name.Trim(),
                Phone = request.Phone.Trim(),
                Email =
                    string.IsNullOrWhiteSpace(
                        request.Email)
                        ? null
                        : request.Email.Trim(),

                Address =
                    request.Address.Trim(),

                City =
                    request.City.Trim(),

                State =
                    request.State.Trim(),

                PinCode =
                    request.PinCode.Trim(),

                IsDefault =
                    request.IsDefault,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.SavedContacts.Add(contact);

        await _db.SaveChangesAsync(
            cancellationToken);

        return Map(contact);
    }

    public async Task<SavedContactDto?>
        UpdateAsync(
            int userId,
            int id,
            SaveContactRequest request,
            CancellationToken cancellationToken)
    {
        var contact =
            await _db.SavedContacts
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id &&
                        x.UserId == userId,
                    cancellationToken);

        if (contact == null)
        {
            return null;
        }

        var type =
            NormalizeType(
                request.ContactType);

        if (request.IsDefault)
        {
            await RemoveOldDefaultAsync(
                userId,
                type,
                id,
                cancellationToken);
        }

        contact.ContactType = type;
        contact.Name =
            request.Name.Trim();
        contact.Phone =
            request.Phone.Trim();

        contact.Email =
            string.IsNullOrWhiteSpace(
                request.Email)
                ? null
                : request.Email.Trim();

        contact.Address =
            request.Address.Trim();

        contact.City =
            request.City.Trim();

        contact.State =
            request.State.Trim();

        contact.PinCode =
            request.PinCode.Trim();

        contact.IsDefault =
            request.IsDefault;

        contact.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync(
            cancellationToken);

        return Map(contact);
    }

    public async Task<bool>
        DeleteAsync(
            int userId,
            int id,
            CancellationToken cancellationToken)
    {
        var contact =
            await _db.SavedContacts
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id &&
                        x.UserId == userId,
                    cancellationToken);

        if (contact == null)
        {
            return false;
        }

        _db.SavedContacts.Remove(contact);

        await _db.SaveChangesAsync(
            cancellationToken);

        return true;
    }

    private async Task RemoveOldDefaultAsync(
        int userId,
        string type,
        int? exceptId,
        CancellationToken cancellationToken)
    {
        var contacts =
            await _db.SavedContacts
                .Where(x =>
                    x.UserId == userId &&
                    x.ContactType == type &&
                    x.IsDefault &&
                    (!exceptId.HasValue ||
                     x.Id != exceptId.Value))
                .ToListAsync(
                    cancellationToken);

        foreach (var contact in contacts)
        {
            contact.IsDefault = false;
            contact.UpdatedAt =
                DateTime.UtcNow;
        }
    }

    private static string NormalizeType(
        string type)
    {
        var value =
            type.Trim();

        if (value.Equals(
            "Sender",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Sender";
        }

        if (value.Equals(
            "Receiver",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Receiver";
        }

        throw new InvalidOperationException(
            "Contact type must be Sender or Receiver.");
    }

    private static SavedContactDto Map(
        SavedContact contact)
    {
        return new SavedContactDto
        {
            Id = contact.Id,
            ContactType =
                contact.ContactType,
            Name = contact.Name,
            Phone = contact.Phone,
            Email = contact.Email,
            Address = contact.Address,
            City = contact.City,
            State = contact.State,
            PinCode = contact.PinCode,
            IsDefault =
                contact.IsDefault,
            CreatedAt =
                contact.CreatedAt
        };
    }
}