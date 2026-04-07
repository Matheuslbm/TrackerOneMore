namespace Tracker.Domain.Exceptions;

/// <summary>
/// Exceção base para todos os erros de regra de negócio no domínio.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }

    public DomainException(string message, Exception innerException)
        : base(message, innerException) { }
}
