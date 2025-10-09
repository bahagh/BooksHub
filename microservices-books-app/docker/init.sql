-- Initialize Books Database Schema

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Email VARCHAR(255) UNIQUE NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    GoogleId VARCHAR(255) UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Books table
CREATE TABLE IF NOT EXISTS Books (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Title VARCHAR(500) NOT NULL,
    Content TEXT NOT NULL,
    UserId UUID NOT NULL,
    WordCount INTEGER DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create BookAnalytics table for word frequency
CREATE TABLE IF NOT EXISTS BookAnalytics (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    BookId UUID NOT NULL,
    Word VARCHAR(100) NOT NULL,
    Frequency INTEGER NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BookId) REFERENCES Books(Id) ON DELETE CASCADE
);

-- Create UserSessions table for JWT management
CREATE TABLE IF NOT EXISTS UserSessions (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL,
    RefreshToken VARCHAR(500) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_userid ON Books(UserId);
CREATE INDEX IF NOT EXISTS idx_books_title ON Books(Title);
CREATE INDEX IF NOT EXISTS idx_bookanalytics_bookid ON BookAnalytics(BookId);
CREATE INDEX IF NOT EXISTS idx_bookanalytics_word ON BookAnalytics(Word);
CREATE INDEX IF NOT EXISTS idx_usersessions_userid ON UserSessions(UserId);
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(Email);
CREATE INDEX IF NOT EXISTS idx_users_googleid ON Users(GoogleId);

-- Create function to update the UpdatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.UpdatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update UpdatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON Books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO Users (Email, FirstName, LastName) VALUES 
('admin@books.com', 'Admin', 'User'),
('user@books.com', 'Test', 'User')
ON CONFLICT (Email) DO NOTHING;

COMMIT;