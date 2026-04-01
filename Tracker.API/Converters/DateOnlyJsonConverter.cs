using System.Text.Json;
using System.Text.Json.Serialization;

namespace Tracker.API.Converters;

/// <summary>
/// Converter customizado para serializar DateOnly como string ISO 8601 (YYYY-MM-DD)
/// </summary>
public class DateOnlyJsonConverter : JsonConverter<DateOnly>
{
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.String)
            throw new JsonException($"Unexpected token {reader.TokenType} when parsing DateOnly");

        var dateString = reader.GetString();
        if (string.IsNullOrWhiteSpace(dateString))
            throw new JsonException("DateOnly value cannot be empty");

        if (DateOnly.TryParse(dateString, out var dateOnly))
            return dateOnly;

        throw new JsonException($"Unable to convert '{dateString}' to DateOnly");
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}
