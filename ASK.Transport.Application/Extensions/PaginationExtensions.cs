using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Extensions;

public static class PaginationExtensions
{
	public static async Task<PagedResult<T>>
		ToPagedResultAsync<T>(
			this IQueryable<T> query,
			int page,
			int pageSize,
			CancellationToken cancellationToken =
				default)
	{
		page =
			page < 1
				? 1
				: page;

		pageSize =
			pageSize < 1
				? 20
				: Math.Min(
					pageSize,
					100);

		var totalRecords =
			await query.CountAsync(
				cancellationToken);

		var totalPages =
			totalRecords == 0
				? 0
				: (int)Math.Ceiling(
					totalRecords /
					(double)pageSize);

		var items =
			await query
				.Skip(
					(page - 1) *
					pageSize)
				.Take(pageSize)
				.ToListAsync(
					cancellationToken);

		return new PagedResult<T>
		{
			Items =
				items,

			Page =
				page,

			PageSize =
				pageSize,

			TotalRecords =
				totalRecords,

			TotalPages =
				totalPages
		};
	}
}