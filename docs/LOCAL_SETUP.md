# Local setup

These instructions are for contributors who want to run the Sunset Post website locally.

The project has two apps:

```text
backend/   # Rails API
frontend/  # React app
```

## Requirements

Install these before starting:

- Ruby 3.3.0
- Bundler
- PostgreSQL
- Node.js
- npm
- Git

Optional services for full feature testing:

- AWS S3 bucket and IAM credentials for production-style image storage
- MTA API key for transit features
- Google Analytics measurement ID for analytics testing
- SMTP credentials for contact form email delivery

## Clone the repository

```bash
git clone git@github.com:elpopes/theSunsetPost.git
cd theSunsetPost
```

## Backend setup

```bash
cd backend
bundle install
```

Create a local `.env` file:

```bash
touch .env
```

Add the values needed for local development:

```text
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
JWT_SECRET_KEY=change_me_to_a_long_random_string
MTA_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET=
SMTP_USERNAME=
SMTP_PASSWORD=
```

Create and migrate the database:

```bash
rails db:create
rails db:migrate
```

Start the Rails server:

```bash
rails server
```

The backend runs at:

```text
http://localhost:3000
```

## Frontend setup

In a second terminal:

```bash
cd frontend
npm install
```

Create a local `.env` file:

```bash
touch .env
```

Add local frontend values:

```text
REACT_APP_API_DEV=http://localhost:3000
REACT_APP_API_PROD=https://www.sunsetpost.org
REACT_APP_GA_ID=
```

Start the React app:

```bash
npm start
```

The frontend runs at:

```text
http://localhost:5000
```

## Admin user

Admin-only features require a user with `admin: true`.

Create one from the Rails console:

```bash
cd backend
rails console
```

```ruby
User.create!(
  email: "admin@example.com",
  password: "password123",
  admin: true
)
```

Use that email and password to log in locally.

## Images and Active Storage

The app uses Rails Active Storage for uploads.

Current development configuration points Active Storage to the `amazon` service, so local uploads require AWS values in `backend/.env` unless you change development storage to local disk.

For production-style image testing, create an S3 bucket and set:

```text
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET=
```

The S3 service is configured for `us-east-1` in `backend/config/storage.yml`.

For purely local disk storage, change this line in `backend/config/environments/development.rb`:

```ruby
config.active_storage.service = :amazon
```

to:

```ruby
config.active_storage.service = :local
```

Do not commit local-only credential or storage changes unless they are part of a planned configuration update.

## Optional services

### MTA transit

Transit features require an MTA API key:

```text
MTA_API_KEY=
```

### Google Analytics

Analytics events require a frontend Google Analytics measurement ID:

```text
REACT_APP_GA_ID=
```

The site will run without this value, but analytics events will not be sent.

### Contact form email

The development mailer is configured to use DreamHost SMTP credentials from environment variables:

```text
SMTP_USERNAME=
SMTP_PASSWORD=
```

If you do not configure SMTP, the site can still run locally, but contact form delivery may fail.

## Development workflow

Create a feature branch before making changes:

```bash
git switch main
git pull origin main
git switch -c feature/your-feature-name
```

Commit and push your work:

```bash
git status
git add .
git commit -m "Describe your change"
git push origin feature/your-feature-name
```

Then open a pull request or share the branch for review.

## Future setup automation

A future `bin/setup` script should automate the common local setup steps, including dependency installation, database creation, migrations, environment file checks, and first-admin-user setup.
