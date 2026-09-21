BEGIN TRANSACTION;
ALTER TABLE [ShipmentScans] DROP CONSTRAINT [FK_ShipmentScans_Bookings_BookingId];

ALTER TABLE [WebhookDeliveryLogs] DROP CONSTRAINT [FK_WebhookDeliveryLogs_PartnerWebhooks_PartnerWebhookId];

DROP INDEX [IX_WebhookDeliveryLogs_PartnerWebhookId_EventName_AttemptedAt] ON [WebhookDeliveryLogs];

DROP INDEX [IX_Vehicles_HubId_IsActive_IsAvailable] ON [Vehicles];

DROP INDEX [IX_TransportTrips_DriverId_Status] ON [TransportTrips];

DROP INDEX [IX_TransportTrips_FromHubId_ToHubId_Status] ON [TransportTrips];

DROP INDEX [IX_TransportTrips_VehicleId_Status] ON [TransportTrips];

DROP INDEX [IX_SystemAlerts_IsResolved_CreatedAt] ON [SystemAlerts];

DROP INDEX [IX_ShipmentScans_ScanCode] ON [ShipmentScans];

DROP INDEX [IX_Shipments_BookingId_Status] ON [Shipments];

DROP INDEX [IX_Shipments_CurrentHubId_Status] ON [Shipments];

DROP INDEX [IX_PaymentTransactions_BookingId_PaymentStatus_CreatedAt] ON [PaymentTransactions];

DROP INDEX [IX_PaymentRefunds_BookingId_Status_CreatedAt] ON [PaymentRefunds];

DROP INDEX [IX_Drivers_HubId_IsActive_IsAvailable] ON [Drivers];

DROP INDEX [IX_DeliveryAttempts_ShipmentId_AttemptNumber] ON [DeliveryAttempts];

DROP INDEX [IX_Bookings_PaymentStatus_CreatedAt] ON [Bookings];

DROP INDEX [IX_Bookings_UserId_BookingStatus_CreatedAt] ON [Bookings];

DROP INDEX [IX_AuditLogs_UserId_CreatedAt] ON [AuditLogs];

DECLARE @var nvarchar(max);
SELECT @var = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WebhookDeliveryLogs]') AND [c].[name] = N'CreatedByUserId');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [WebhookDeliveryLogs] DROP CONSTRAINT ' + @var + ';');
ALTER TABLE [WebhookDeliveryLogs] DROP COLUMN [CreatedByUserId];

DECLARE @var1 nvarchar(max);
SELECT @var1 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WebhookDeliveryLogs]') AND [c].[name] = N'DeletedAt');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [WebhookDeliveryLogs] DROP CONSTRAINT ' + @var1 + ';');
ALTER TABLE [WebhookDeliveryLogs] DROP COLUMN [DeletedAt];

DECLARE @var2 nvarchar(max);
SELECT @var2 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WebhookDeliveryLogs]') AND [c].[name] = N'DeletedByUserId');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [WebhookDeliveryLogs] DROP CONSTRAINT ' + @var2 + ';');
ALTER TABLE [WebhookDeliveryLogs] DROP COLUMN [DeletedByUserId];

DECLARE @var3 nvarchar(max);
SELECT @var3 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WebhookDeliveryLogs]') AND [c].[name] = N'IsDeleted');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [WebhookDeliveryLogs] DROP CONSTRAINT ' + @var3 + ';');
ALTER TABLE [WebhookDeliveryLogs] DROP COLUMN [IsDeleted];

DECLARE @var4 nvarchar(max);
SELECT @var4 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WebhookDeliveryLogs]') AND [c].[name] = N'RowVersion');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [WebhookDeliveryLogs] DROP CONSTRAINT ' + @var4 + ';');
ALTER TABLE [WebhookDeliveryLogs] DROP COLUMN [RowVersion];

DECLARE @var5 nvarchar(max);
SELECT @var5 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WebhookDeliveryLogs]') AND [c].[name] = N'UpdatedAt');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [WebhookDeliveryLogs] DROP CONSTRAINT ' + @var5 + ';');
ALTER TABLE [WebhookDeliveryLogs] DROP COLUMN [UpdatedAt];

DECLARE @var6 nvarchar(max);
SELECT @var6 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[WebhookDeliveryLogs]') AND [c].[name] = N'UpdatedByUserId');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [WebhookDeliveryLogs] DROP CONSTRAINT ' + @var6 + ';');
ALTER TABLE [WebhookDeliveryLogs] DROP COLUMN [UpdatedByUserId];

DECLARE @var7 nvarchar(max);
SELECT @var7 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TransportTrips]') AND [c].[name] = N'CreatedByUserId');
IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [TransportTrips] DROP CONSTRAINT ' + @var7 + ';');
ALTER TABLE [TransportTrips] DROP COLUMN [CreatedByUserId];

DECLARE @var8 nvarchar(max);
SELECT @var8 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TransportTrips]') AND [c].[name] = N'DeletedByUserId');
IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [TransportTrips] DROP CONSTRAINT ' + @var8 + ';');
ALTER TABLE [TransportTrips] DROP COLUMN [DeletedByUserId];

DECLARE @var9 nvarchar(max);
SELECT @var9 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TransportTrips]') AND [c].[name] = N'UpdatedByUserId');
IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [TransportTrips] DROP CONSTRAINT ' + @var9 + ';');
ALTER TABLE [TransportTrips] DROP COLUMN [UpdatedByUserId];

DECLARE @var10 nvarchar(max);
SELECT @var10 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'CreatedByUserId');
IF @var10 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var10 + ';');
ALTER TABLE [PartnerWebhooks] DROP COLUMN [CreatedByUserId];

DECLARE @var11 nvarchar(max);
SELECT @var11 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'DeletedAt');
IF @var11 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var11 + ';');
ALTER TABLE [PartnerWebhooks] DROP COLUMN [DeletedAt];

DECLARE @var12 nvarchar(max);
SELECT @var12 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'DeletedByUserId');
IF @var12 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var12 + ';');
ALTER TABLE [PartnerWebhooks] DROP COLUMN [DeletedByUserId];

DECLARE @var13 nvarchar(max);
SELECT @var13 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'IsDeleted');
IF @var13 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var13 + ';');
ALTER TABLE [PartnerWebhooks] DROP COLUMN [IsDeleted];

DECLARE @var14 nvarchar(max);
SELECT @var14 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'RowVersion');
IF @var14 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var14 + ';');
ALTER TABLE [PartnerWebhooks] DROP COLUMN [RowVersion];

DECLARE @var15 nvarchar(max);
SELECT @var15 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'UpdatedByUserId');
IF @var15 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var15 + ';');
ALTER TABLE [PartnerWebhooks] DROP COLUMN [UpdatedByUserId];

DECLARE @var16 nvarchar(max);
SELECT @var16 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ShipmentScans]') AND [c].[name] = N'ScanCode');
IF @var16 IS NOT NULL EXEC(N'ALTER TABLE [ShipmentScans] DROP CONSTRAINT ' + @var16 + ';');
ALTER TABLE [ShipmentScans] ALTER COLUMN [ScanCode] nvarchar(100) NOT NULL;

DECLARE @var17 nvarchar(max);
SELECT @var17 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ShipmentScans]') AND [c].[name] = N'BookingId');
IF @var17 IS NOT NULL EXEC(N'ALTER TABLE [ShipmentScans] DROP CONSTRAINT ' + @var17 + ';');
ALTER TABLE [ShipmentScans] ALTER COLUMN [BookingId] int NULL;

DECLARE @var18 nvarchar(max);
SELECT @var18 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'WebhookUrl');
IF @var18 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var18 + ';');
ALTER TABLE [PartnerWebhooks] ALTER COLUMN [WebhookUrl] nvarchar(1000) NOT NULL;

DECLARE @var19 nvarchar(max);
SELECT @var19 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'SecretKey');
IF @var19 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var19 + ';');
ALTER TABLE [PartnerWebhooks] ALTER COLUMN [SecretKey] nvarchar(500) NOT NULL;

DROP INDEX [IX_PartnerWebhooks_PartnerName] ON [PartnerWebhooks];
DECLARE @var20 nvarchar(max);
SELECT @var20 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'PartnerName');
IF @var20 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var20 + ';');
ALTER TABLE [PartnerWebhooks] ALTER COLUMN [PartnerName] nvarchar(150) NOT NULL;
CREATE INDEX [IX_PartnerWebhooks_PartnerName] ON [PartnerWebhooks] ([PartnerName]);

DECLARE @var21 nvarchar(max);
SELECT @var21 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'LastError');
IF @var21 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var21 + ';');
ALTER TABLE [PartnerWebhooks] ALTER COLUMN [LastError] nvarchar(2000) NULL;

DECLARE @var22 nvarchar(max);
SELECT @var22 = QUOTENAME([d].[name])
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PartnerWebhooks]') AND [c].[name] = N'Events');
IF @var22 IS NOT NULL EXEC(N'ALTER TABLE [PartnerWebhooks] DROP CONSTRAINT ' + @var22 + ';');
ALTER TABLE [PartnerWebhooks] ALTER COLUMN [Events] nvarchar(1000) NULL;

CREATE TABLE [OperationsExceptions] (
    [Id] int NOT NULL IDENTITY,
    [ExceptionNumber] nvarchar(50) NOT NULL,
    [ExceptionType] nvarchar(100) NOT NULL,
    [Severity] nvarchar(30) NOT NULL,
    [Status] nvarchar(30) NOT NULL,
    [ReferenceType] nvarchar(100) NULL,
    [ReferenceNumber] nvarchar(100) NULL,
    [Department] nvarchar(100) NULL,
    [AssignedDepartment] nvarchar(100) NULL,
    [Title] nvarchar(200) NULL,
    [Description] nvarchar(2000) NULL,
    [BookingId] int NULL,
    [ShipmentId] int NULL,
    [TripId] int NULL,
    [DriverId] int NULL,
    [VehicleId] int NULL,
    [AssignedToUserId] int NULL,
    [EscalationLevel] int NOT NULL,
    [DetectedAt] datetime2 NOT NULL,
    [DueAt] datetime2 NULL,
    [LastEscalatedAt] datetime2 NULL,
    [AcknowledgedAt] datetime2 NULL,
    [AcknowledgedByUserId] int NULL,
    [ResolvedAt] datetime2 NULL,
    [ResolvedByUserId] int NULL,
    [Resolution] nvarchar(2000) NULL,
    [ResolutionNotes] nvarchar(2000) NULL,
    [IsAutoGenerated] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_OperationsExceptions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_OperationsExceptions_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_OperationsExceptions_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_OperationsExceptions_Shipments_ShipmentId] FOREIGN KEY ([ShipmentId]) REFERENCES [Shipments] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_OperationsExceptions_TransportTrips_TripId] FOREIGN KEY ([TripId]) REFERENCES [TransportTrips] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_OperationsExceptions_Users_AssignedToUserId] FOREIGN KEY ([AssignedToUserId]) REFERENCES [Users] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_OperationsExceptions_Vehicles_VehicleId] FOREIGN KEY ([VehicleId]) REFERENCES [Vehicles] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [WebhookOutboxMessages] (
    [Id] int NOT NULL IDENTITY,
    [EventName] nvarchar(100) NOT NULL,
    [ReferenceId] nvarchar(200) NOT NULL,
    [Payload] nvarchar(max) NOT NULL,
    [Status] nvarchar(30) NOT NULL,
    [AttemptCount] int NOT NULL,
    [MaxAttempts] int NOT NULL,
    [NextAttemptAt] datetime2 NOT NULL,
    [ProcessingStartedAt] datetime2 NULL,
    [CompletedAt] datetime2 NULL,
    [FailedAt] datetime2 NULL,
    [LastError] nvarchar(2000) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_WebhookOutboxMessages] PRIMARY KEY ([Id])
);

CREATE TABLE [OperationsExceptionHistories] (
    [Id] int NOT NULL IDENTITY,
    [OperationsExceptionId] int NOT NULL,
    [Action] nvarchar(100) NOT NULL,
    [Description] nvarchar(2000) NULL,
    [OldStatus] nvarchar(50) NULL,
    [NewStatus] nvarchar(50) NULL,
    [OldSeverity] nvarchar(50) NULL,
    [NewSeverity] nvarchar(50) NULL,
    [EscalationLevel] int NULL,
    [Notes] nvarchar(2000) NULL,
    [UserId] int NULL,
    [PerformedByUserId] int NULL,
    [ActionAt] datetime2 NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_OperationsExceptionHistories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_OperationsExceptionHistories_OperationsExceptions_OperationsExceptionId] FOREIGN KEY ([OperationsExceptionId]) REFERENCES [OperationsExceptions] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_OperationsExceptionHistories_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE SET NULL
);

CREATE INDEX [IX_WebhookDeliveryLogs_EventName_ReferenceId] ON [WebhookDeliveryLogs] ([EventName], [ReferenceId]);

CREATE INDEX [IX_WebhookDeliveryLogs_PartnerWebhookId_AttemptedAt] ON [WebhookDeliveryLogs] ([PartnerWebhookId], [AttemptedAt]);

CREATE INDEX [IX_Vehicles_HubId] ON [Vehicles] ([HubId]);

CREATE INDEX [IX_TransportTrips_DriverId] ON [TransportTrips] ([DriverId]);

CREATE INDEX [IX_TransportTrips_FromHubId] ON [TransportTrips] ([FromHubId]);

CREATE INDEX [IX_TransportTrips_VehicleId] ON [TransportTrips] ([VehicleId]);

CREATE INDEX [IX_Shipments_BookingId] ON [Shipments] ([BookingId]);

CREATE INDEX [IX_Shipments_CurrentHubId] ON [Shipments] ([CurrentHubId]);

CREATE INDEX [IX_PaymentTransactions_BookingId] ON [PaymentTransactions] ([BookingId]);

CREATE INDEX [IX_PaymentRefunds_BookingId] ON [PaymentRefunds] ([BookingId]);

CREATE INDEX [IX_PartnerWebhooks_IsActive] ON [PartnerWebhooks] ([IsActive]);

CREATE INDEX [IX_Drivers_HubId] ON [Drivers] ([HubId]);

CREATE INDEX [IX_DeliveryAttempts_ShipmentId] ON [DeliveryAttempts] ([ShipmentId]);

CREATE INDEX [IX_Bookings_UserId] ON [Bookings] ([UserId]);

CREATE INDEX [IX_OperationsExceptionHistories_OperationsExceptionId_CreatedAt] ON [OperationsExceptionHistories] ([OperationsExceptionId], [CreatedAt]);

CREATE INDEX [IX_OperationsExceptionHistories_UserId] ON [OperationsExceptionHistories] ([UserId]);

CREATE INDEX [IX_OperationsExceptions_AssignedToUserId] ON [OperationsExceptions] ([AssignedToUserId]);

CREATE INDEX [IX_OperationsExceptions_BookingId] ON [OperationsExceptions] ([BookingId]);

CREATE INDEX [IX_OperationsExceptions_DriverId] ON [OperationsExceptions] ([DriverId]);

CREATE UNIQUE INDEX [IX_OperationsExceptions_ExceptionNumber] ON [OperationsExceptions] ([ExceptionNumber]);

CREATE INDEX [IX_OperationsExceptions_ShipmentId] ON [OperationsExceptions] ([ShipmentId]);

CREATE INDEX [IX_OperationsExceptions_Status_Severity_DueAt] ON [OperationsExceptions] ([Status], [Severity], [DueAt]);

CREATE INDEX [IX_OperationsExceptions_TripId] ON [OperationsExceptions] ([TripId]);

CREATE INDEX [IX_OperationsExceptions_VehicleId] ON [OperationsExceptions] ([VehicleId]);

CREATE INDEX [IX_WebhookOutboxMessages_EventName_ReferenceId] ON [WebhookOutboxMessages] ([EventName], [ReferenceId]);

CREATE INDEX [IX_WebhookOutboxMessages_Status_NextAttemptAt] ON [WebhookOutboxMessages] ([Status], [NextAttemptAt]);

ALTER TABLE [ShipmentScans] ADD CONSTRAINT [FK_ShipmentScans_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([Id]) ON DELETE SET NULL;

ALTER TABLE [WebhookDeliveryLogs] ADD CONSTRAINT [FK_WebhookDeliveryLogs_PartnerWebhooks_PartnerWebhookId] FOREIGN KEY ([PartnerWebhookId]) REFERENCES [PartnerWebhooks] ([Id]) ON DELETE CASCADE;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260914183733_FinalizeBackendV1', N'10.0.12');

COMMIT;
GO

