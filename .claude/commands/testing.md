# Testing Skill

You are now in testing mode for Oppi.

## Testing Stack
- **Unit/Integration**: Vitest
- **Component**: React Testing Library
- **E2E**: Playwright (web) / Detox (mobile)
- **API**: Vitest + supertest

## Testing Philosophy

### Test Pyramid
```
        /\
       /E2E\        Few, critical paths only
      /──────\
     /Integration\  API + DB tests
    /──────────────\
   /   Unit Tests   \  Most tests here
  /──────────────────\
```

### What to Test
- **Unit**: Pure functions, utilities, business logic
- **Integration**: API endpoints, database queries
- **Component**: User interactions, rendering states
- **E2E**: Critical user journeys (signup, complete lesson, etc.)

## Test Patterns

### Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { calculateXP } from './gamification';

describe('calculateXP', () => {
  it('returns base XP for completed lesson', () => {
    expect(calculateXP({ lessonCompleted: true })).toBe(10);
  });

  it('adds bonus XP for perfect score', () => {
    expect(calculateXP({ lessonCompleted: true, score: 100 })).toBe(15);
  });
});
```

### Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('calls onPress when clicked', () => {
    const onPress = vi.fn();
    render(<Button label="Click me" onPress={onPress} />);

    fireEvent.click(screen.getByText('Click me'));

    expect(onPress).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Click me" onPress={() => {}} disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### API Test
```typescript
import { describe, it, expect } from 'vitest';
import { createTestContext } from '../test-utils';

describe('User API', () => {
  it('creates a user with valid input', async () => {
    const ctx = await createTestContext();

    const user = await ctx.caller.user.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user.email).toBe('test@example.com');
  });
});
```

## When Writing Tests

1. **Test behavior, not implementation** - what does the user see/experience?
2. **Use descriptive test names** - "should X when Y" format
3. **Arrange-Act-Assert** - clear structure in each test
4. **One assertion per test** (ideally) - easier to debug failures
5. **Mock external dependencies** - network, time, random

## Test Commands
```bash
pnpm test           # Run all tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report
pnpm test:e2e       # E2E tests
```

## Coverage Goals
- Unit tests: 80%+ coverage on business logic
- Integration: All API endpoints have happy path tests
- E2E: Critical user journeys covered
