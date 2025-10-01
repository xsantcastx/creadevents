# TstoneWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
## CI/CD with GitHub Actions and Firebase

1. Create or select a Firebase project and enable Hosting. Note the project id (for example `tstone-web-prod`).
2. Update `.firebaserc` and `firebase.json` with the correct project id if you plan to run deployments locally.
3. Generate a service account key with the `Firebase Hosting Admin` role and save the JSON content as a GitHub secret:
   - Secret name `FIREBASE_SERVICE_ACCOUNT`
   - Value is the entire JSON blob
4. Add another GitHub secret named `FIREBASE_PROJECT_ID` that stores the same project id string.
5. Push the repository to GitHub. The workflow in `.github/workflows/ci-cd.yml` will:
   - Build the Angular app on every pull request and push to `main`
   - Publish a Firebase preview for pull requests (skipped for forks)
   - Deploy to the live Firebase Hosting site when commits land on `main`
6. Local deployments remain available through `npm run deploy` (this command runs the production build and calls `npx firebase deploy --only hosting`). Ensure you have `firebase-tools` installed locally via `npm install -g firebase-tools`.

Preview channels created by the workflow expire automatically after seven days. You can close them early with `firebase hosting:channel:delete`.
