using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BooksService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Books",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Author = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Genre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Language = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true, defaultValue: "en"),
                    WordCount = table.Column<int>(type: "integer", nullable: false),
                    CharacterCount = table.Column<int>(type: "integer", nullable: false),
                    ReadingTimeMinutes = table.Column<double>(type: "double precision", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ViewCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    AverageRating = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    RatingCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Tags = table.Column<string>(type: "jsonb", nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Books", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BookComments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BookId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ParentCommentId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsEdited = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookComments_BookComments_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalTable: "BookComments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookComments_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BookRatings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BookId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Review = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookRatings_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BookViews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BookId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ViewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ReadingDuration = table.Column<TimeSpan>(type: "interval", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookViews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookViews_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookComments_BookId",
                table: "BookComments",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_BookComments_CreatedAt",
                table: "BookComments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_BookComments_ParentCommentId",
                table: "BookComments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_BookComments_UserId",
                table: "BookComments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BookRatings_BookId",
                table: "BookRatings",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_BookRatings_BookId_UserId",
                table: "BookRatings",
                columns: new[] { "BookId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookRatings_UserId",
                table: "BookRatings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Books_CreatedAt",
                table: "Books",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Genre",
                table: "Books",
                column: "Genre");

            migrationBuilder.CreateIndex(
                name: "IX_Books_IsPublic",
                table: "Books",
                column: "IsPublic");

            migrationBuilder.CreateIndex(
                name: "IX_Books_IsPublic_Status",
                table: "Books",
                columns: new[] { "IsPublic", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Books_Language",
                table: "Books",
                column: "Language");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Status",
                table: "Books",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Title",
                table: "Books",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_Books_UserId",
                table: "Books",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Books_UserId_Status",
                table: "Books",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_BookViews_BookId",
                table: "BookViews",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_BookViews_BookId_UserId_ViewedAt",
                table: "BookViews",
                columns: new[] { "BookId", "UserId", "ViewedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_BookViews_UserId",
                table: "BookViews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BookViews_ViewedAt",
                table: "BookViews",
                column: "ViewedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookComments");

            migrationBuilder.DropTable(
                name: "BookRatings");

            migrationBuilder.DropTable(
                name: "BookViews");

            migrationBuilder.DropTable(
                name: "Books");
        }
    }
}
