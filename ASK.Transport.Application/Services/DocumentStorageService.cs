namespace ASK.Group.Api.Services;

public class DocumentStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    private static readonly string[] AllowedExtensions =
    {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    };

    public DocumentStorageService(
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _environment = environment;
        _configuration = configuration;
    }

    public async Task<(string StoredFileName, long FileSize)>
        SaveAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new InvalidOperationException(
                "File is empty.");
        }

        var maxFileSizeMb =
            _configuration.GetValue<int>(
                "FileStorage:MaxFileSizeMb");

        if (maxFileSizeMb <= 0)
        {
            maxFileSizeMb = 10;
        }

        var maxBytes =
            maxFileSizeMb * 1024L * 1024L;

        if (file.Length > maxBytes)
        {
            throw new InvalidOperationException(
                $"Maximum file size is {maxFileSizeMb} MB.");
        }

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException(
                "Only PDF, JPG, JPEG and PNG files are allowed.");
        }

        var uploadFolder =
            _configuration["FileStorage:Folder"];

        if (string.IsNullOrWhiteSpace(uploadFolder))
        {
            uploadFolder = "Uploads";
        }

        var rootPath =
            Path.Combine(
                _environment.ContentRootPath,
                uploadFolder);

        Directory.CreateDirectory(rootPath);

        var storedFileName =
            $"{Guid.NewGuid():N}{extension}";

        var fullPath =
            Path.Combine(
                rootPath,
                storedFileName);

        await using var stream =
            new FileStream(
                fullPath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None);

        await file.CopyToAsync(stream);

        return (
            storedFileName,
            file.Length);
    }

    public string GetFullPath(
        string storedFileName)
    {
        var uploadFolder =
            _configuration["FileStorage:Folder"];

        if (string.IsNullOrWhiteSpace(uploadFolder))
        {
            uploadFolder = "Uploads";
        }

        return Path.Combine(
            _environment.ContentRootPath,
            uploadFolder,
            storedFileName);
    }

    public void Delete(
        string storedFileName)
    {
        var fullPath =
            GetFullPath(storedFileName);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }
}