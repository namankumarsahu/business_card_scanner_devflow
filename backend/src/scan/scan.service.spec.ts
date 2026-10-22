import { ScanService } from './scan.service';

describe('ScanService', () => {
  const service = new ScanService();

  it('extracts structured fields from OCR text', () => {
    const result = service.parseText([
      'Ava Patel',
      'Senior Software Engineer',
      'Acme Technologies',
      'ava.patel@acme.com',
      '+1 (415) 555-0100',
      'www.acme.com',
      '100 Market Street',
    ].join('\n'));

    expect(result.fullName).toBe('Ava Patel');
    expect(result.jobTitle).toContain('Engineer');
    expect(result.emails).toEqual([{ email: 'ava.patel@acme.com', type: 'work' }]);
    expect(result.phones?.[0].phone).toBe('14155550100');
    expect(result.website).toBe('https://www.acme.com');
  });
});
