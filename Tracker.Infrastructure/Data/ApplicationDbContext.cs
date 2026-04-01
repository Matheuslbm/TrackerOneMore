using Microsoft.EntityFrameworkCore;
using Tracker.Domain.Entities;

namespace Tracker.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    { }

    public DbSet<User> Users { get; set; }
    public DbSet<Habit> Habits { get; set; }
    public DbSet<HabitLog> HabitLogs { get; set; }
    public DbSet<Challenge> Challenges { get; set; }
    public DbSet<ChallengeDailyLog> ChallengeDailyLogs { get; set; }
    public DbSet<DailyMood> DailyMoods { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasKey(u => u.Id);
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Habit>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(h => h.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HabitLog>()
            .HasOne<Habit>()
            .WithMany(h => h.Logs)
            .HasForeignKey(l => l.HabitId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HabitLog>()
            .HasIndex(l => new { l.HabitId, l.Date })
            .IsUnique();
    }
}