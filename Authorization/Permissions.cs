namespace ASK.Group.Api.Authorization;

public static class Permissions
{
    public static class Users
    {
        public const string View =
            "Users.View";

        public const string Create =
            "Users.Create";

        public const string Edit =
            "Users.Edit";

        public const string Delete =
            "Users.Delete";

        public const string ManagePermissions =
            "Users.ManagePermissions";
    }

    public static class Roles
    {
        public const string View =
            "Roles.View";

        public const string Create =
            "Roles.Create";

        public const string Edit =
            "Roles.Edit";

        public const string Delete =
            "Roles.Delete";

        public const string ManagePermissions =
            "Roles.ManagePermissions";
    }

    public static class Bookings
    {
        public const string View =
            "Bookings.View";

        public const string ViewOwn =
            "Bookings.ViewOwn";

        public const string Create =
            "Bookings.Create";

        public const string Edit =
            "Bookings.Edit";

        public const string Cancel =
            "Bookings.Cancel";

        public const string Assign =
            "Bookings.Assign";

        public const string UpdateStatus =
            "Bookings.UpdateStatus";
    }

    public static class Tracking
    {
        public const string View =
            "Tracking.View";

        public const string Update =
            "Tracking.Update";
    }

    public static class Payments
    {
        public const string View =
            "Payments.View";

        public const string Create =
            "Payments.Create";

        public const string Refund =
            "Payments.Refund";

        public const string Reconcile =
            "Payments.Reconcile";

        public const string ViewRefunds =
            "Payments.ViewRefunds";
    }

    public static class Invoices
    {
        public const string View =
            "Invoices.View";

        public const string Create =
            "Invoices.Create";

        public const string Email =
            "Invoices.Email";
    }

    public static class Documents
    {
        public const string View =
            "Documents.View";

        public const string Upload =
            "Documents.Upload";

        public const string Delete =
            "Documents.Delete";

        public const string UploadPod =
            "Documents.UploadPOD";
    }

    public static class Branches
    {
        public const string View =
            "Branches.View";

        public const string Create =
            "Branches.Create";

        public const string Edit =
            "Branches.Edit";

        public const string Delete =
            "Branches.Delete";
    }

    public static class Hubs
    {
        public const string View =
            "Hubs.View";

        public const string Create =
            "Hubs.Create";

        public const string Edit =
            "Hubs.Edit";

        public const string Delete =
            "Hubs.Delete";
    }

    public static class Drivers
    {
        public const string View =
            "Drivers.View";

        public const string Create =
            "Drivers.Create";

        public const string Edit =
            "Drivers.Edit";

        public const string Delete =
            "Drivers.Delete";

        public const string Assign =
            "Drivers.Assign";
    }

    public static class Vehicles
    {
        public const string View =
            "Vehicles.View";

        public const string Create =
            "Vehicles.Create";

        public const string Edit =
            "Vehicles.Edit";

        public const string Delete =
            "Vehicles.Delete";

        public const string Assign =
            "Vehicles.Assign";
    }

    public static class Shipments
    {
        public const string View =
            "Shipments.View";

        public const string Create =
            "Shipments.Create";

        public const string Edit =
            "Shipments.Edit";

        public const string Assign =
            "Shipments.Assign";

        public const string UpdateStatus =
            "Shipments.UpdateStatus";
    }

    public static class Trips
    {
        public const string View =
            "Trips.View";

        public const string Create =
            "Trips.Create";

        public const string Edit =
            "Trips.Edit";

        public const string Assign =
            "Trips.Assign";

        public const string Start =
            "Trips.Start";

        public const string Complete =
            "Trips.Complete";
    }

    public static class Routes
    {
        public const string View =
            "Routes.View";

        public const string Create =
            "Routes.Create";

        public const string Edit =
            "Routes.Edit";

        public const string Delete =
            "Routes.Delete";
    }

    public static class RateCards
    {
        public const string View =
            "RateCards.View";

        public const string Create =
            "RateCards.Create";

        public const string Edit =
            "RateCards.Edit";

        public const string Delete =
            "RateCards.Delete";
    }

    public static class Delivery
    {
        public const string View =
            "Delivery.View";

        public const string GenerateOtp =
            "Delivery.GenerateOtp";

        public const string Confirm =
            "Delivery.Confirm";

        public const string FailAttempt =
            "Delivery.FailAttempt";

        public const string Reattempt =
            "Delivery.Reattempt";
    }

    public static class Reports
    {
        public const string View =
            "Reports.View";

        public const string Export =
            "Reports.Export";
    }

    public static class Settings
    {
        public const string View =
            "Settings.View";

        public const string Edit =
            "Settings.Edit";

        public const string CompanyProfile =
            "Settings.CompanyProfile";

        public const string Numbering =
            "Settings.Numbering";
    }

    public static class Audit
    {
        public const string View =
            "Audit.View";
    }

    public static class Notifications
    {
        public const string View =
            "Notifications.View";

        public const string Send =
            "Notifications.Send";

        public const string ManageTemplates =
            "Notifications.ManageTemplates";

        public const string ViewLogs =
            "Notifications.ViewLogs";

        public const string ViewAlerts =
            "Notifications.ViewAlerts";

        public const string ResolveAlerts =
            "Notifications.ResolveAlerts";
    }
}