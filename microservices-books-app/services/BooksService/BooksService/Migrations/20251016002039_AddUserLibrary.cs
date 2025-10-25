using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BooksService.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserLibraries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    BookId = table.Column<Guid>(type: "uuid", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLibraries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserLibraries_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserLibraries_AddedAt",
                table: "UserLibraries",
                column: "AddedAt");

            migrationBuilder.CreateIndex(
                name: "IX_UserLibraries_BookId",
                table: "UserLibraries",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_UserLibraries_UserId",
                table: "UserLibraries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserLibraries_UserId_BookId",
                table: "UserLibraries",
                columns: new[] { "UserId", "BookId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserLibraries");
        }
    }
}
