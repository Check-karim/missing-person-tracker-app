# Contributing to Missing Person Tracker

First off, thank you for considering contributing to Missing Person Tracker! It's people like you that make this project better and help us achieve our mission of reuniting missing persons with their loved ones.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**
* **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain the behavior you expected to see**
* **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

#### Pull Request Guidelines

* **Follow the existing code style**
* **Write clear commit messages**
* **Update documentation as needed**
* **Add tests for new features**
* **Ensure all tests pass**
* **Keep pull requests focused on a single concern**

## Development Process

### Setting Up Development Environment

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd tracker
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Set up the database
   ```bash
   mysql -u root -p < database.sql
   ```

5. Run the development server
   ```bash
   npm run dev
   ```

### Coding Standards

#### TypeScript

* Use TypeScript for all new files
* Define proper interfaces and types
* Avoid using `any` type
* Use strict mode
* Document complex functions with JSDoc comments

Example:
```typescript
interface MissingPerson {
  id: number;
  full_name: string;
  // ... other fields
}

/**
 * Fetches a missing person by ID
 * @param id - The unique identifier of the missing person
 * @returns Promise resolving to the missing person data
 */
async function getMissingPerson(id: number): Promise<MissingPerson> {
  // implementation
}
```

#### React/Next.js

* Use functional components with hooks
* Keep components small and focused
* Use proper prop types
* Implement error boundaries
* Use proper loading states

Example:
```typescript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export default function MyComponent({ title, onSubmit }: Props) {
  // implementation
}
```

#### Styling

* Use Tailwind CSS utility classes
* Follow mobile-first approach
* Keep custom CSS minimal
* Use consistent spacing and colors
* Ensure accessibility

Example:
```jsx
<button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
  Submit
</button>
```

#### API Routes

* Validate all inputs
* Use proper HTTP status codes
* Implement error handling
* Use middleware for authentication
* Return consistent response formats

Example:
```typescript
export async function GET(req: NextRequest) {
  try {
    // implementation
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Testing

* Write tests for new features
* Ensure all existing tests pass
* Test on multiple browsers
* Test mobile responsiveness
* Test accessibility

### Commit Messages

Use clear and meaningful commit messages:

* `feat: Add user authentication`
* `fix: Resolve database connection issue`
* `docs: Update README with installation steps`
* `style: Format code with Prettier`
* `refactor: Simplify user service logic`
* `test: Add tests for missing person API`
* `chore: Update dependencies`

### Branch Naming

Use descriptive branch names:

* `feature/user-authentication`
* `fix/database-connection`
* `docs/installation-guide`
* `refactor/api-structure`

## Project Structure

```
tracker/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── public/              # Static assets
└── database.sql         # Database schema
```

## What to Work On

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

### High Priority

Issues labeled `high priority` or `bug` should be addressed first.

### Feature Requests

Check issues labeled `enhancement` for new features to implement.

## Getting Help

* Check the README.md for documentation
* Review existing issues and pull requests
* Ask questions in issue comments
* Contact maintainers if needed

## Recognition

Contributors will be recognized in:
* Project README
* Release notes
* Contributors page

## Additional Resources

* [Next.js Documentation](https://nextjs.org/docs)
* [React Documentation](https://react.dev)
* [TypeScript Documentation](https://www.typescriptlang.org/docs)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)
* [MySQL Documentation](https://dev.mysql.com/doc)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Missing Person Tracker! Together, we can make a difference in bringing missing persons home. ❤️

