# Contributing to Cortex

First off, thank you for considering contributing to Cortex! It’s people like you that make Cortex such a great tool.

## How to Get Started

### 1. Dev Environment

1.  **Fork and Clone** the repository.
2.  **Frontend**:
    ```bash
    cd frontend/CortexFront
    npm install
    npx expo start
    ```
3.  **Backend**:
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```

### 2. Coding Standards

- **TypeScript**: Use strict types where possible.
- **Components**: Functional components with hooks are preferred.
- **Styling**: Use `StyleSheet.create` with consistent naming.
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).

### 3. Tests

Before submitting a PR, make sure your changes don't break the build:
- Run `npm test` in the frontend.
- Run `mvn test` in the backend.

### 4. PR Process

1.  Create a branch for your fix or feature (e.g., `fix/bug-description`).
2.  Make your changes and commit with descriptive messages.
3.  Submit a Pull Request targeting the `main` branch.
4.  Reference any related issues in the PR description.

### 5. Review Expectations

Maintainers will review your code for:
- Logic correctness.
- Code readability.
- Adherence to the project's design system.

---

## Code of Conduct

By contributing to this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).
