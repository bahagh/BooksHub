using AutoMapper;
using Microsoft.EntityFrameworkCore;
using BooksService.Data;
using BooksService.DTOs;
using BooksService.Models;
using Ganss.Xss;

namespace BooksService.Services
{
    public interface ICommentsService
    {
        Task<CommentDto> CreateCommentAsync(Guid bookId, CreateCommentDto createCommentDto, Guid? userId);
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
        private readonly INotificationClient _notificationClient;
        private readonly IUserClient _userClient;
        private readonly HtmlSanitizer _htmlSanitizer;

        public CommentsService(
            BooksDbContext context,
            IMapper mapper,
            ILogger<CommentsService> logger,
            INotificationClient notificationClient,
            IUserClient userClient)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _notificationClient = notificationClient;
            _userClient = userClient;
            
            // Configure HTML sanitizer to remove all dangerous tags and attributes
            _htmlSanitizer = new HtmlSanitizer();
            // Allow only safe HTML tags for basic formatting
            _htmlSanitizer.AllowedTags.Clear();
            _htmlSanitizer.AllowedTags.Add("b");
            _htmlSanitizer.AllowedTags.Add("i");
            _htmlSanitizer.AllowedTags.Add("u");
            _htmlSanitizer.AllowedTags.Add("p");
            _htmlSanitizer.AllowedTags.Add("br");
            // Remove all attributes to prevent javascript: URLs, onclick, etc.
            _htmlSanitizer.AllowedAttributes.Clear();
        }

        public async Task<CommentDto> CreateCommentAsync(Guid bookId, CreateCommentDto createCommentDto, Guid? userId)
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
            comment.UserId = userId; // Can be null for anonymous comments
            comment.IsAnonymous = createCommentDto.IsAnonymous;
            comment.AnonymousUsername = createCommentDto.AnonymousUsername;
            
            // Sanitize comment content to prevent XSS attacks
            comment.Content = _htmlSanitizer.Sanitize(comment.Content);

            _context.BookComments.Add(comment);
            await _context.SaveChangesAsync();

            if (userId.HasValue)
            {
                _logger.LogInformation("User {UserId} commented on book {BookId}", userId, bookId);
            }
            else
            {
                _logger.LogInformation("Anonymous user '{AnonymousUsername}' commented on book {BookId}", 
                    createCommentDto.AnonymousUsername, bookId);
            }

            // Trigger notification for comment reply
            if (createCommentDto.ParentCommentId.HasValue)
            {
                var parentComment = await _context.BookComments
                    .FirstOrDefaultAsync(c => c.Id == createCommentDto.ParentCommentId.Value);
                
                if (parentComment != null && parentComment.UserId.HasValue && parentComment.UserId != userId)
                {
                    var commenterName = createCommentDto.IsAnonymous 
                        ? createCommentDto.AnonymousUsername 
                        : "A user";
                    
                    // Trigger notification (fire and forget - don't wait for response)
                    _ = _notificationClient.NotifyCommentReplyAsync(
                        parentComment.UserId.Value,
                        commenterName,
                        book.Title,
                        bookId.ToString(),
                        comment.Id.ToString());
                }
            }

            // Load the comment with navigation properties for response
            var savedComment = await _context.BookComments
                .Include(c => c.Replies)
                .FirstAsync(c => c.Id == comment.Id);

            var commentDto = _mapper.Map<CommentDto>(savedComment);
            
            // Set display username
            if (commentDto.IsAnonymous)
            {
                commentDto.Username = commentDto.AnonymousUsername;
            }
            else if (userId.HasValue)
            {
                // Fetch username from UserService
                var userInfo = await _userClient.GetUserInfoAsync(userId.Value);
                commentDto.Username = userInfo?.FullName ?? "Unknown User";
            }

            // Notify book creator about new comment
            if (book.UserId != userId)
            {
                var commenterName = commentDto.IsAnonymous 
                    ? commentDto.AnonymousUsername ?? "Anonymous"
                    : commentDto.Username ?? "A user";
                
                _ = _notificationClient.NotifyBookCommentAsync(
                    book.UserId,
                    commenterName,
                    book.Title,
                    bookId.ToString(),
                    comment.Id.ToString());
            }

            return commentDto;
        }

        public async Task<CommentDto?> UpdateCommentAsync(Guid bookId, Guid commentId, UpdateCommentDto updateCommentDto, Guid userId)
        {
            var comment = await _context.BookComments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.BookId == bookId && c.UserId == userId);

            if (comment == null)
                return null;

            _mapper.Map(updateCommentDto, comment);
            
            // Sanitize updated content to prevent XSS attacks
            comment.Content = _htmlSanitizer.Sanitize(comment.Content);
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

            // Fetch real usernames for all comments (including replies)
            var allComments = new List<CommentDto>(commentDtos);
            foreach (var comment in commentDtos)
            {
                if (comment.Replies != null)
                {
                    allComments.AddRange(comment.Replies);
                }
            }

            // Get unique user IDs
            var userIds = allComments
                .Where(c => !c.IsAnonymous && c.UserId.HasValue)
                .Select(c => c.UserId!.Value)
                .Distinct()
                .ToList();

            // Fetch user info in batch
            if (userIds.Any())
            {
                var usersInfo = await _userClient.GetUsersInfoAsync(userIds);

                // Update usernames for all comments
                foreach (var comment in allComments)
                {
                    if (comment.IsAnonymous)
                    {
                        comment.Username = comment.AnonymousUsername ?? "Anonymous";
                    }
                    else if (comment.UserId.HasValue && usersInfo.ContainsKey(comment.UserId.Value))
                    {
                        var userInfo = usersInfo[comment.UserId.Value];
                        comment.Username = userInfo.FullName ?? "Unknown User";
                    }
                    else
                    {
                        comment.Username = "Unknown User";
                    }
                }
            }
            else
            {
                // Set usernames for anonymous comments
                foreach (var comment in allComments)
                {
                    if (comment.IsAnonymous)
                    {
                        comment.Username = comment.AnonymousUsername ?? "Anonymous";
                    }
                }
            }

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