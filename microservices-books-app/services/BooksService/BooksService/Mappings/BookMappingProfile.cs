using AutoMapper;
using BooksService.DTOs;
using BooksService.Models;
using System.Text.Json;

namespace BooksService.Mappings
{
    public class BookMappingProfile : Profile
    {
        public BookMappingProfile()
        {
            // Book mappings
            CreateMap<CreateBookDto, Book>()
                .ForMember(dest => dest.Tags, opt => opt.MapFrom<TagsResolver>())
                .ForMember(dest => dest.WordCount, opt => opt.MapFrom<WordCountResolver>())
                .ForMember(dest => dest.CharacterCount, opt => opt.MapFrom(src => src.Content.Length))
                .ForMember(dest => dest.ReadingTimeMinutes, opt => opt.MapFrom<ReadingTimeResolver>());

            CreateMap<Book, BookDto>()
                .ForMember(dest => dest.Tags, opt => opt.MapFrom<TagsFromJsonResolver>())
                .ForMember(dest => dest.EstimatedReadingTime, opt => opt.MapFrom(src => src.EstimatedReadingTime))
                .ForMember(dest => dest.IsPublished, opt => opt.MapFrom(src => src.IsPublished))
                .ForMember(dest => dest.CommentCount, opt => opt.MapFrom(src => src.Comments.Count(c => !c.IsDeleted)));

            CreateMap<Book, BookListDto>()
                .ForMember(dest => dest.Tags, opt => opt.MapFrom<TagsFromJsonResolver>())
                .ForMember(dest => dest.EstimatedReadingTime, opt => opt.MapFrom(src => src.EstimatedReadingTime))
                .ForMember(dest => dest.IsPublished, opt => opt.MapFrom(src => src.IsPublished))
                .ForMember(dest => dest.CommentCount, opt => opt.MapFrom(src => src.Comments.Count(c => !c.IsDeleted)));

            CreateMap<UpdateBookDto, Book>()
                .ForMember(dest => dest.Tags, opt => opt.MapFrom<UpdateTagsResolver>())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Rating mappings
            CreateMap<CreateRatingDto, BookRating>();
            CreateMap<BookRating, RatingDto>();
            CreateMap<UpdateRatingDto, BookRating>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Comment mappings
            CreateMap<CreateCommentDto, BookComment>();
            CreateMap<BookComment, CommentDto>();
            CreateMap<UpdateCommentDto, BookComment>();
        }
    }

    public class TagsResolver : IValueResolver<CreateBookDto, Book, string?>
    {
        public string? Resolve(CreateBookDto source, Book destination, string? destMember, ResolutionContext context)
        {
            return source.Tags != null ? JsonSerializer.Serialize(source.Tags) : null;
        }
    }

    public class UpdateTagsResolver : IValueResolver<UpdateBookDto, Book, string?>
    {
        public string? Resolve(UpdateBookDto source, Book destination, string? destMember, ResolutionContext context)
        {
            return source.Tags != null ? JsonSerializer.Serialize(source.Tags) : null;
        }
    }

    public class TagsFromJsonResolver : IValueResolver<Book, object, string[]?>
    {
        public string[]? Resolve(Book source, object destination, string[]? destMember, ResolutionContext context)
        {
            if (string.IsNullOrEmpty(source.Tags))
                return null;

            try
            {
                return JsonSerializer.Deserialize<string[]>(source.Tags);
            }
            catch
            {
                return null;
            }
        }
    }

    public class WordCountResolver : IValueResolver<CreateBookDto, Book, int>
    {
        public int Resolve(CreateBookDto source, Book destination, int destMember, ResolutionContext context)
        {
            return CountWords(source.Content);
        }

        private static int CountWords(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return 0;

            return content.Split(new char[] { ' ', '\t', '\n', '\r' }, 
                StringSplitOptions.RemoveEmptyEntries).Length;
        }
    }

    public class ReadingTimeResolver : IValueResolver<CreateBookDto, Book, double>
    {
        public double Resolve(CreateBookDto source, Book destination, double destMember, ResolutionContext context)
        {
            return CalculateReadingTime(source.Content);
        }

        private static double CalculateReadingTime(string content)
        {
            const double wordsPerMinute = 200.0;
            var wordCount = CountWords(content);
            return Math.Max(1.0, wordCount / wordsPerMinute);
        }

        private static int CountWords(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return 0;

            return content.Split(new char[] { ' ', '\t', '\n', '\r' }, 
                StringSplitOptions.RemoveEmptyEntries).Length;
        }
    }
}