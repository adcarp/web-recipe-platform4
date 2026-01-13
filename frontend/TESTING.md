# Unit Testing Guide - Vitest

This project uses **Vitest** for unit testing, combined with **React Testing Library** for component testing.

## Setup Overview

### Installed Packages

- **vitest**: Fast unit test framework
- **@vitest/ui**: Visual UI for test results
- **@testing-library/react**: Testing utilities for React components
- **@testing-library/jest-dom**: DOM matchers for assertions
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: JavaScript DOM implementation for testing

### Configuration Files

- **vitest.config.ts**: Main Vitest configuration
- **vitest.setup.ts**: Test setup file with Firebase mocks and global setup

## Running Tests

```bash
# Run tests once and exit
npm test -- --run

# Run tests in watch mode (default)
npm test

# Run tests with UI dashboard
npm test:ui

# Generate coverage report
npm test:coverage
```

## Test Structure

Tests are organized in `__tests__` folders alongside the code they test:

```
src/
├── components/
│   ├── __tests__/
│   │   ├── Toast.test.tsx
│   │   └── RecipeCard.test.tsx
│   ├── Toast.tsx
│   └── RecipeCard.tsx
├── hooks/
│   ├── __tests__/
│   │   └── useFavorites.test.ts
│   └── useFavorites.ts
└── __tests__/
    └── test-utils.ts
```

## Writing Tests

### Example: Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Example: Hook Test

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('returns initial value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current).toBe('initial');
  });
});
```

## Test Utilities

The `src/__tests__/test-utils.ts` file provides helpful testing utilities:

- **renderWithProviders**: Render components with auth/context providers
- **mockRecipe**: Predefined recipe object for testing
- **mockUser**: Predefined user object for testing
- **createMockAuthUser**: Factory for creating mock users
- **waitForAsync**: Wait for async operations
- **mockLocalStorage**: Mock localStorage

### Using Test Utils

```typescript
import { renderWithProviders, mockRecipe } from '@/src/__tests__/test-utils';
import RecipeCard from '@/components/RecipeCard';

describe('RecipeCard', () => {
  it('renders with mock data', () => {
    renderWithProviders(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument();
  });
});
```

## Mocked Modules

The following Firebase modules are mocked in `vitest.setup.ts`:

- `firebase/app`: `initializeApp`, `getApps`, `getApp`
- `firebase/auth`: Authentication functions
- `firebase/firestore`: Firestore database functions
- `firebase/storage`: Cloud Storage functions

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what users see and interact with
2. **Use Meaningful Descriptions**: Write clear test names that describe expected behavior
3. **Follow AAA Pattern**: Arrange → Act → Assert
4. **Mock External Dependencies**: Mock Firebase, APIs, etc.
5. **Keep Tests Isolated**: Each test should be independent
6. **Use Test Utils**: Leverage provided utilities for consistency

## Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  // Arrange: Set up test data
  const mockOnClick = vi.fn();

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup();

    // Act: Render component and interact
    render(<MyComponent onClick={mockOnClick} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify behavior
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('displays async data correctly', async () => {
    render(<MyComponent />);

    // Wait for async data to load
    await waitFor(() => {
      expect(screen.getByText('Loaded Data')).toBeInTheDocument();
    });
  });
});
```

## Common Assertions

```typescript
// Element existence
expect(element).toBeInTheDocument();
expect(element).toBeVisible();

// Text content
expect(screen.getByText('Hello')).toBeInTheDocument();
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

// Attributes
expect(button).toHaveAttribute('type', 'submit');
expect(input).toHaveValue('text');

// Classes
expect(element).toHaveClass('active');

// Functions
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
```

## Debugging Tests

Run a specific test file:
```bash
npm test -- Toast.test.tsx
```

Run tests matching a pattern:
```bash
npm test -- --grep "renders correctly"
```

Use `screen.debug()` to see rendered output:
```typescript
import { screen } from '@testing-library/react';

screen.debug(); // Prints entire DOM
screen.getByRole('button').debug(); // Prints specific element
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
