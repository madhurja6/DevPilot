package devPilot.backend.services.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.json.JsonMapper;

import devPilot.backend.dto.CitationDto;

class CitationMapperTest {

    private final CitationMapper citationMapper = new CitationMapper(JsonMapper.builder().build());

    @Test
    void roundTripsCitations() {
        List<CitationDto> citations = List.of(
                new CitationDto("src/Main.java", 10, 18, "java"));

        assertEquals(citations, citationMapper.fromJson(citationMapper.toJson(citations)));
    }

    @Test
    void returnsNoCitationsWhenStoredValueIsMissing() {
        assertEquals(List.of(), citationMapper.fromJson(null));
        assertEquals(List.of(), citationMapper.fromJson(" "));
    }
}
