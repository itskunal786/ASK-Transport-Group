using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(
        AskTransportDbContext db)
    {
        if (!await db.States.AnyAsync())
        {
            var states = new List<State>
            {
                new() { Name = "Andhra Pradesh", Code = "AP", IsUnionTerritory = false },
                new() { Name = "Arunachal Pradesh", Code = "AR", IsUnionTerritory = false },
                new() { Name = "Assam", Code = "AS", IsUnionTerritory = false },
                new() { Name = "Bihar", Code = "BR", IsUnionTerritory = false },
                new() { Name = "Chhattisgarh", Code = "CG", IsUnionTerritory = false },
                new() { Name = "Goa", Code = "GA", IsUnionTerritory = false },
                new() { Name = "Gujarat", Code = "GJ", IsUnionTerritory = false },
                new() { Name = "Haryana", Code = "HR", IsUnionTerritory = false },
                new() { Name = "Himachal Pradesh", Code = "HP", IsUnionTerritory = false },
                new() { Name = "Jharkhand", Code = "JH", IsUnionTerritory = false },
                new() { Name = "Karnataka", Code = "KA", IsUnionTerritory = false },
                new() { Name = "Kerala", Code = "KL", IsUnionTerritory = false },
                new() { Name = "Madhya Pradesh", Code = "MP", IsUnionTerritory = false },
                new() { Name = "Maharashtra", Code = "MH", IsUnionTerritory = false },
                new() { Name = "Manipur", Code = "MN", IsUnionTerritory = false },
                new() { Name = "Meghalaya", Code = "ML", IsUnionTerritory = false },
                new() { Name = "Mizoram", Code = "MZ", IsUnionTerritory = false },
                new() { Name = "Nagaland", Code = "NL", IsUnionTerritory = false },
                new() { Name = "Odisha", Code = "OD", IsUnionTerritory = false },
                new() { Name = "Punjab", Code = "PB", IsUnionTerritory = false },
                new() { Name = "Rajasthan", Code = "RJ", IsUnionTerritory = false },
                new() { Name = "Sikkim", Code = "SK", IsUnionTerritory = false },
                new() { Name = "Tamil Nadu", Code = "TN", IsUnionTerritory = false },
                new() { Name = "Telangana", Code = "TS", IsUnionTerritory = false },
                new() { Name = "Tripura", Code = "TR", IsUnionTerritory = false },
                new() { Name = "Uttar Pradesh", Code = "UP", IsUnionTerritory = false },
                new() { Name = "Uttarakhand", Code = "UK", IsUnionTerritory = false },
                new() { Name = "West Bengal", Code = "WB", IsUnionTerritory = false },

                new() { Name = "Andaman and Nicobar Islands", Code = "AN", IsUnionTerritory = true },
                new() { Name = "Chandigarh", Code = "CH", IsUnionTerritory = true },
                new() { Name = "Dadra and Nagar Haveli and Daman and Diu", Code = "DN", IsUnionTerritory = true },
                new() { Name = "Delhi", Code = "DL", IsUnionTerritory = true },
                new() { Name = "Jammu and Kashmir", Code = "JK", IsUnionTerritory = true },
                new() { Name = "Ladakh", Code = "LA", IsUnionTerritory = true },
                new() { Name = "Lakshadweep", Code = "LD", IsUnionTerritory = true },
                new() { Name = "Puducherry", Code = "PY", IsUnionTerritory = true }
            };

            await db.States.AddRangeAsync(states);
            await db.SaveChangesAsync();
        }

        if (!await db.Cities.AnyAsync())
        {
            var states = await db.States
                .ToDictionaryAsync(
                    x => x.Code,
                    x => x.Id);

            var cities = new List<City>();

            void AddCity(
                string name,
                string stateCode)
            {
                if (states.TryGetValue(
                    stateCode,
                    out var stateId))
                {
                    cities.Add(
                        new City
                        {
                            Name = name,
                            StateId = stateId,
                            IsActive = true
                        });
                }
            }

            AddCity("Bhopal", "MP");
            AddCity("Indore", "MP");
            AddCity("Jabalpur", "MP");
            AddCity("Gwalior", "MP");
            AddCity("Ujjain", "MP");

            AddCity("Mumbai", "MH");
            AddCity("Pune", "MH");
            AddCity("Nagpur", "MH");
            AddCity("Nashik", "MH");
            AddCity("Thane", "MH");

            AddCity("New Delhi", "DL");

            AddCity("Jaipur", "RJ");
            AddCity("Jodhpur", "RJ");
            AddCity("Udaipur", "RJ");
            AddCity("Kota", "RJ");

            AddCity("Ahmedabad", "GJ");
            AddCity("Surat", "GJ");
            AddCity("Vadodara", "GJ");
            AddCity("Rajkot", "GJ");

            AddCity("Bengaluru", "KA");
            AddCity("Mysuru", "KA");
            AddCity("Mangaluru", "KA");

            AddCity("Chennai", "TN");
            AddCity("Coimbatore", "TN");
            AddCity("Madurai", "TN");

            AddCity("Hyderabad", "TS");
            AddCity("Warangal", "TS");

            AddCity("Kolkata", "WB");
            AddCity("Howrah", "WB");

            AddCity("Lucknow", "UP");
            AddCity("Kanpur", "UP");
            AddCity("Noida", "UP");
            AddCity("Agra", "UP");
            AddCity("Varanasi", "UP");

            AddCity("Patna", "BR");
            AddCity("Gaya", "BR");

            AddCity("Ranchi", "JH");
            AddCity("Jamshedpur", "JH");

            AddCity("Raipur", "CG");
            AddCity("Bhilai", "CG");

            AddCity("Bhubaneswar", "OD");
            AddCity("Cuttack", "OD");

            AddCity("Chandigarh", "CH");

            AddCity("Ludhiana", "PB");
            AddCity("Amritsar", "PB");

            AddCity("Gurugram", "HR");
            AddCity("Faridabad", "HR");

            AddCity("Kochi", "KL");
            AddCity("Thiruvananthapuram", "KL");
            AddCity("Kozhikode", "KL");

            AddCity("Dehradun", "UK");
            AddCity("Haridwar", "UK");

            AddCity("Shimla", "HP");

            AddCity("Guwahati", "AS");

            AddCity("Panaji", "GA");

            await db.Cities.AddRangeAsync(cities);
            await db.SaveChangesAsync();
        }

        if (!await db.TransportServices.AnyAsync())
        {
            var services =
                new List<TransportService>
                {
                    new()
                    {
                        Name = "Standard",
                        Description =
                            "Standard road transport service",
                        BaseRate = 120,
                        PerKgRate = 18,
                        ExtraDeliveryDays = 1,
                        IsActive = true
                    },

                    new()
                    {
                        Name = "Express",
                        Description =
                            "Fast priority delivery",
                        BaseRate = 220,
                        PerKgRate = 28,
                        ExtraDeliveryDays = 0,
                        IsActive = true
                    },

                    new()
                    {
                        Name = "Economy",
                        Description =
                            "Economical transport service",
                        BaseRate = 90,
                        PerKgRate = 14,
                        ExtraDeliveryDays = 2,
                        IsActive = true
                    },

                    new()
                    {
                        Name = "Heavy Goods",
                        Description =
                            "Transport for heavy shipments",
                        BaseRate = 500,
                        PerKgRate = 35,
                        ExtraDeliveryDays = 2,
                        IsActive = true
                    },

                    new()
                    {
                        Name = "Premium",
                        Description =
                            "Premium priority delivery",
                        BaseRate = 350,
                        PerKgRate = 32,
                        ExtraDeliveryDays = 0,
                        IsActive = true
                    }
                };

            await db.TransportServices
                .AddRangeAsync(services);

            await db.SaveChangesAsync();
        }

        if (!await db.PinCodes.AnyAsync())
        {
            var pins =
                new List<PinCode>
                {
                    new()
                    {
                        Pin = "462001",
                        City = "Bhopal",
                        District = "Bhopal",
                        State = "Madhya Pradesh",
                        DeliveryDays = 1,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "452001",
                        City = "Indore",
                        District = "Indore",
                        State = "Madhya Pradesh",
                        DeliveryDays = 1,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "110001",
                        City = "New Delhi",
                        District = "New Delhi",
                        State = "Delhi",
                        DeliveryDays = 3,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "400001",
                        City = "Mumbai",
                        District = "Mumbai",
                        State = "Maharashtra",
                        DeliveryDays = 3,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "411001",
                        City = "Pune",
                        District = "Pune",
                        State = "Maharashtra",
                        DeliveryDays = 3,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "560001",
                        City = "Bengaluru",
                        District = "Bengaluru Urban",
                        State = "Karnataka",
                        DeliveryDays = 4,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "600001",
                        City = "Chennai",
                        District = "Chennai",
                        State = "Tamil Nadu",
                        DeliveryDays = 4,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "700001",
                        City = "Kolkata",
                        District = "Kolkata",
                        State = "West Bengal",
                        DeliveryDays = 4,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "302001",
                        City = "Jaipur",
                        District = "Jaipur",
                        State = "Rajasthan",
                        DeliveryDays = 3,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "380001",
                        City = "Ahmedabad",
                        District = "Ahmedabad",
                        State = "Gujarat",
                        DeliveryDays = 3,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "500001",
                        City = "Hyderabad",
                        District = "Hyderabad",
                        State = "Telangana",
                        DeliveryDays = 4,
                        Serviceable = true
                    },

                    new()
                    {
                        Pin = "226001",
                        City = "Lucknow",
                        District = "Lucknow",
                        State = "Uttar Pradesh",
                        DeliveryDays = 3,
                        Serviceable = true
                    }
                };

            await db.PinCodes
                .AddRangeAsync(pins);

            await db.SaveChangesAsync();
        }

        if (!await db.Users.AnyAsync(
                x =>
                    x.Email ==
                    "admin@askgroup.com"))
        {
            var admin =
                new AppUser
                {
                    Name =
                        "ASK GROUP Admin",

                    Email =
                        "admin@askgroup.com",

                    Phone =
                        "9999999999",

                    PasswordHash =
                        BCrypt.Net.BCrypt
                            .HashPassword(
                                "Admin@123"),

                    Role =
                        UserRole.Admin,

                    IsVerified =
                        true,

                    IsActive =
                        true,

                    CreatedAt =
                        DateTime.UtcNow
                };

            await db.Users.AddAsync(admin);

            await db.SaveChangesAsync();
        }

        if (!await db.Users.AnyAsync(
                x =>
                    x.Email ==
                    "user@askgroup.com"))
        {
            var user =
                new AppUser
                {
                    Name =
                        "Demo User",

                    Email =
                        "user@askgroup.com",

                    Phone =
                        "8888888888",

                    PasswordHash =
                        BCrypt.Net.BCrypt
                            .HashPassword(
                                "User@123"),

                    Role =
                        UserRole.User,

                    IsVerified =
                        true,

                    IsActive =
                        true,

                    CreatedAt =
                        DateTime.UtcNow
                };

            await db.Users.AddAsync(user);

            await db.SaveChangesAsync();

            //await RbacSeeder.SeedAsync(db);
        }
    }
}