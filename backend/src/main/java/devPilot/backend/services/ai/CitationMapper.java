package devPilot.backend.services.ai;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import devPilot.backend.dto.CitationDto;
import lombok.RequiredArgsConstructor;

/***
 * Converts vector-store{@link Document}s into API citations
 */
@Component
@RequiredArgsConstructor
public class CitationMapper {
    private final JsonMapper jsonMapper;

    public CitationDto fromDocument(Document document) {
        var meta = document.getMetadata();
        return new CitationDto(
                stringVal(meta.get("filePath")),
                intVal(meta.get("startLine")),
                intVal(meta.get("endLine")),
                stringVal(meta.get("language")));
    }

    private static String stringVal(Object value) {
        return value == null ? null : value.toString();
    }

    private static Integer intVal(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String string) {
            try {
                return Integer.valueOf(string);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    public String toJson(List<CitationDto> citations) {
        try {
            return jsonMapper.writeValueAsString(citations);
        } catch (JacksonException e) {
            return "[]";
        }
    }

    public List<CitationDto> fromJson(String citations) {
        if (citations == null || citations.isBlank()) {
            return List.of();
        }

        try {
            return jsonMapper.readValue(
                    citations,
                    new TypeReference<List<CitationDto>>() {});
        } catch (JacksonException e) {
            throw new IllegalStateException("Could not parse saved chat citations", e);
        }
    }
}
