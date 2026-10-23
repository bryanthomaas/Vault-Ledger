import { describe, it, expect, vi } from 'vitest';
import { ForecastingService } from './forecastingService';

describe('ForecastingService (unit)', () => {
  it('generates 6-month Monte Carlo trajectory with valid p10 <= p50 <= p90 confidence bands', async () => {
    const mockDb: any = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    };

    const mockLedger: any = {
      getNetWorth: vi.fn().mockResolvedValue(15000000), // $150,000.00
    };

    const service = new ForecastingService(mockDb, mockLedger);
    const forecast = await service.generateForecast('mock-user-123', 500);

    expect(forecast.currentNetWorthCents).toBe(15000000);
    expect(forecast.simulatedRuns).toBe(500);
    expect(forecast.points).toHaveLength(6);

    for (const point of forecast.points) {
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Fundamental quantile relationship: p10 <= p50 <= p90
      expect(point.p10NetWorth).toBeLessThanOrEqual(point.p50NetWorth);
      expect(point.p50NetWorth).toBeLessThanOrEqual(point.p90NetWorth);
    }
  });
});
