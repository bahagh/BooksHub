using FluentValidation;
using BooksService.DTOs;

namespace BooksService.Validators
{
    public class CreateBookDtoValidator : AbstractValidator<CreateBookDto>
    {
        public CreateBookDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .Length(1, 500).WithMessage("Title must be between 1 and 500 characters")
                .Must(NotContainInvalidCharacters).WithMessage("Title contains invalid characters");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Content is required")
                .Length(10, 1000000).WithMessage("Content must be between 10 and 1,000,000 characters");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

            RuleFor(x => x.Author)
                .MaximumLength(100).WithMessage("Author must not exceed 100 characters");

            RuleFor(x => x.Genre)
                .MaximumLength(50).WithMessage("Genre must not exceed 50 characters");

            RuleFor(x => x.Language)
                .MaximumLength(20).WithMessage("Language must not exceed 20 characters")
                .Must(BeValidLanguageCode).WithMessage("Invalid language code");

            RuleFor(x => x.Tags)
                .Must(HaveValidTags).WithMessage("Tags must be valid")
                .When(x => x.Tags != null);
        }

        private bool NotContainInvalidCharacters(string title)
        {
            var invalidChars = new[] { '<', '>', '"', '\'', '&' };
            return !invalidChars.Any(title.Contains);
        }

        private bool BeValidLanguageCode(string? language)
        {
            if (string.IsNullOrEmpty(language)) return true;
            
            var validLanguages = new[] { "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar" };
            return validLanguages.Contains(language.ToLower());
        }

        private bool HaveValidTags(string[]? tags)
        {
            if (tags == null) return true;
            
            return tags.Length <= 10 && 
                   tags.All(tag => !string.IsNullOrWhiteSpace(tag) && tag.Length <= 50);
        }
    }

    public class UpdateBookDtoValidator : AbstractValidator<UpdateBookDto>
    {
        public UpdateBookDtoValidator()
        {
            RuleFor(x => x.Title)
                .Length(1, 500).WithMessage("Title must be between 1 and 500 characters")
                .Must(NotContainInvalidCharacters).WithMessage("Title contains invalid characters")
                .When(x => !string.IsNullOrEmpty(x.Title));

            RuleFor(x => x.Content)
                .Length(10, 1000000).WithMessage("Content must be between 10 and 1,000,000 characters")
                .When(x => !string.IsNullOrEmpty(x.Content));

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters")
                .When(x => x.Description != null);

            RuleFor(x => x.Author)
                .MaximumLength(100).WithMessage("Author must not exceed 100 characters")
                .When(x => x.Author != null);

            RuleFor(x => x.Genre)
                .MaximumLength(50).WithMessage("Genre must not exceed 50 characters")
                .When(x => x.Genre != null);

            RuleFor(x => x.Language)
                .MaximumLength(20).WithMessage("Language must not exceed 20 characters")
                .Must(BeValidLanguageCode).WithMessage("Invalid language code")
                .When(x => x.Language != null);

            RuleFor(x => x.Tags)
                .Must(HaveValidTags).WithMessage("Tags must be valid")
                .When(x => x.Tags != null);
        }

        private bool NotContainInvalidCharacters(string? title)
        {
            if (string.IsNullOrEmpty(title)) return true;
            var invalidChars = new[] { '<', '>', '"', '\'', '&' };
            return !invalidChars.Any(title.Contains);
        }

        private bool BeValidLanguageCode(string? language)
        {
            if (string.IsNullOrEmpty(language)) return true;
            
            var validLanguages = new[] { "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar" };
            return validLanguages.Contains(language.ToLower());
        }

        private bool HaveValidTags(string[]? tags)
        {
            if (tags == null) return true;
            
            return tags.Length <= 10 && 
                   tags.All(tag => !string.IsNullOrWhiteSpace(tag) && tag.Length <= 50);
        }
    }

    public class BookSearchDtoValidator : AbstractValidator<BookSearchDto>
    {
        public BookSearchDtoValidator()
        {
            RuleFor(x => x.Page)
                .GreaterThan(0).WithMessage("Page must be greater than 0");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100).WithMessage("PageSize must be between 1 and 100");

            RuleFor(x => x.SortBy)
                .Must(BeValidSortField).WithMessage("Invalid sort field");

            RuleFor(x => x.SortOrder)
                .Must(x => x.ToLower() == "asc" || x.ToLower() == "desc")
                .WithMessage("Sort order must be 'asc' or 'desc'");

            RuleFor(x => x.MinRating)
                .InclusiveBetween(1.0, 5.0).WithMessage("MinRating must be between 1 and 5")
                .When(x => x.MinRating.HasValue);
        }

        private bool BeValidSortField(string sortBy)
        {
            var validFields = new[] { "Title", "CreatedAt", "UpdatedAt", "WordCount", "ViewCount", "AverageRating" };
            return validFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase);
        }
    }
}