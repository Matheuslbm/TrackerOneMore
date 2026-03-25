namespace Tracker.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }

    // construtor para forçar a criação com dados válidos
    public User(string name, string email, string passwordHash)
    {
        Name = name;
        Email = email;
        PasswordHash = passwordHash;
    }

    public void UpdatePassword(string newHash)
    {
        PasswordHash = newHash;
    }
}