using AutoMapper;
using Microsoft.EntityFrameworkCore;
using BooksService.Data;
using BooksService.DTOs;
using BooksService.Models;

namespace BooksService.Services
{
    public interface ICommentsService
    {
        Task<CommentDto> CreateCommentAsync(Guid bookId, CreateCommentDto createCommentDto, Guid userId);
        Task<CommentDto?> UpdateCommentAsync(Guid bookId, Guid commentId, UpdateCommentDto updateCommentDto, Guid userId);
        Task<bool> DeleteCommentAsync(Guid bookId, Guid commentId, Guid userId);
        Task<PaginatedResult<CommentDto>> GetBookCommentsAsync(Guid bookId, int page = 1, int pageSize = 10);
        Task<IEnumerable<CommentDto>> GetCommentRepliesAsync(Guid commentId);
        Task<int> GetBookCommentsCountAsync(Guid bookId);
    }

    public class CommentsService : ICommentsService
    {
        private readonly BooksDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<CommentsService> _logger;

        public CommentsService(BooksDbContext context, IMapper mapper, ILogger<CommentsService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<CommentDto> CreateCommentAsync(Guid bookId, CreateCommentDto createCommentDto, Guid userId)
        {
            // Verify book exists
            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
                throw new InvalidOperationException("Book not found");

            // If it's a reply, verify parent comment exists
            if (createCommentDto.ParentCommentId.HasValue)
            {
                var parentComment = await _context.BookComments
                    .FirstOrDefaultAsync(c => c.Id == createCommentDto.ParentCommentId.Value && c.BookId == bookId);
                
                if (parentComment == null)
                    throw new InvalidOperationException("Parent comment not found");
            }

            var comment = _mapper.Map<BookComment>(createCommentDto);
            comment.BookId = bookId;
            comment.UserId = userId;

            _context.BookComments.Add(comment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} commented on book {BookId}", userId, bookId);

            // Load the comment with navigation properties for response
            var savedComment = await _context.BookComments
                .Include(c => c.Replies)
                .FirstAsync(c => c.Id == comment.Id);

            return _mapper.Map<CommentDto>(savedComment);
        }

        public async Task<CommentDto?> UpdateCommentAsync(Guid bookId, Guid commentId, UpdateCommentDto updateCommentDto, Guid userId)
        {
            var comment = await _context.BookComments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.BookId == bookId && c.UserId == userId);

            if (comment == null)
                return null;

            _mapper.Map(updateCommentDto, comment);
            comment.IsEdited = true;

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated comment {CommentId} on book {BookId}", 
                userId, commentId, bookId);

            return _mapper.Map<CommentDto>(comment);
        }

        public async Task<bool> DeleteCommentAsync(Guid bookId, Guid commentId, Guid userId)
        {
            var comment = await _context.BookComments
                .Include(c => c.Replies)
                .FirstOrDefaultAsync(c => c.Id == commentId && c.BookId == bookId && c.UserId == userId);

            if (comment == null)
                return false;

            // If comment has replies, mark as deleted but keep structure
            if (comment.Replies.Any())
            {
                comment.Content = "[This comment has been deleted]";
                comment.IsEdited = true;
            }
            else
            {
                _context.BookComments.Remove(comment);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} deleted comment {CommentId} on book {BookId}", 
                userId, commentId, bookId);

            return true;
        }

        public async Task<PaginatedResult<CommentDto>> GetBookCommentsAsync(Guid bookId, int page = 1, int pageSize = 10)
        {
            var query = _context.BookComments
                .Where(c => c.BookId == bookId && c.ParentCommentId == null) // Only top-level comments
                .Include(c => c.Replies)
                .OrderByDescending(c => c.CreatedAt);

            var totalCount = await query.CountAsync();

            var comments = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var commentDtos = _mapper.Map<List<CommentDto>>(comments);

            return new PaginatedResult<CommentDto>
            {
                Items = commentDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<IEnumerable<CommentDto>> GetCommentRepliesAsync(Guid commentId)
        {
            var replies = await _context.BookComments
                .Where(c => c.ParentCommentId == commentId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CommentDto>>(replies);
        }

        public async Task<int> GetBookCommentsCountAsync(Guid bookId)
        {
            return await _context.BookComments
                .Where(c => c.BookId == bookId)
                .CountAsync();
        }
    }
}