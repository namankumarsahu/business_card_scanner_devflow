import { VoiceService } from './voice.service';

describe('VoiceService', () => {
  const service = new VoiceService();

  it('extracts contact details from a transcript', () => {
    const result = service.parseTranscript(
      'Jane Doe email jane.doe@example.com mobile 415-555-0100 website example.com',
    );

    expect(result.emails).toEqual([{ email: 'jane.doe@example.com', type: 'work' }]);
    expect(result.phones?.[0].phone).toBe('4155550100');
    expect(result.website).toBe('https://example.com');
  });
});
