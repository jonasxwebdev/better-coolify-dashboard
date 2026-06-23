# Better Coolify Dashboard

> Forked from [kalayciburak/coolify-dashboard](https://github.com/kalayciburak/coolify-dashboard) (MIT License).

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=flat&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat)

A modern, production-ready dashboard for monitoring Coolify applications, services, and databases with comprehensive multi-language support.

## Quick Start

### Docker Deployment

```bash
docker pull YOUR_DOCKERHUB_USERNAME/better-coolify-dashboard:latest

docker run -d -p 5000:5000 \
  --name coolify-dashboard \
  -e "ADMIN_USERNAME=admin" \
  -e "ADMIN_PASSWORD=your_secure_password" \
  -e "ADMIN_2FA_SECRET=your_2fa_secret_key" \
  -e "JWT_SECRET=your_jwt_secret_key" \
  -e "ALLOWED_ORIGINS=https://dashboard.kalayciburak.com.tr" \
  -e "COOLIFY_BASE_URL=https://coolify.kalayciburak.com.tr" \
  -e "COOLIFY_TOKEN=your_coolify_api_token" \
  -e "DASHBOARD_USER_TYPE=admin" \
  YOUR_DOCKERHUB_USERNAME/better-coolify-dashboard:latest
```

Access the dashboard at `http://localhost:5000`

---

## Installation on Coolify

### Step 1: Create New Application

Navigate to your Coolify instance and create a new application:

- Click **"Add New"** in the Coolify dashboard
- Select **"Docker Image"** as the deployment type
- Enter image name: `YOUR_DOCKERHUB_USERNAME/better-coolify-dashboard:latest`

### Step 2: General Configuration

Configure the basic settings:

- **Domain**: `dashboard.kalayciburak.com.tr`
- **Port**: `5000`
- Configure network and storage settings as needed

### Step 3: Environment Variables

Set the following required environment variables:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_2FA_SECRET=your_2fa_secret_key
JWT_SECRET=your_jwt_secret_key
ALLOWED_ORIGINS=https://dashboard.kalayciburak.com.tr
COOLIFY_BASE_URL=https://coolify.kalayciburak.com.tr
COOLIFY_TOKEN=your_coolify_api_token
DASHBOARD_USER_TYPE=admin
```

### Step 4: Generate 2FA Secret

Generate a secure 2FA secret for authentication:

```bash
# If running locally
cd server
npm run generate-2fa

# If using Docker, generate manually:
node -e "console.log(require('speakeasy').generateSecret({length: 32}).base32)"
```

Copy the generated secret and use it as `ADMIN_2FA_SECRET` in your environment variables.

### Step 5: Generate Coolify API Token

**Important**: Before deploying, generate your Coolify API token with proper permissions based on your user type:

#### For Viewer Mode (Read-Only Access)
1. Navigate to your Coolify instance settings
2. Go to **API Tokens** section
3. Click **"Create New Token"**
4. Select the following permissions:
   - **read**: Enable all read permissions
   - **read:sensitive**: Enable sensitive data read access
5. Copy the generated token and use it as `COOLIFY_TOKEN`
6. Set `DASHBOARD_USER_TYPE=viewer` in environment variables

**Note**: The `read:sensitive` permission is required to access detailed resource information, including environment variables and sensitive configuration data.

#### For Admin Mode (Full Control)
1. Navigate to your Coolify instance settings
2. Go to **API Tokens** section
3. Click **"Create New Token"**
4. Select the following permissions:
   - **write**: Enable all write permissions (includes read access)
5. Copy the generated token and use it as `COOLIFY_TOKEN`
6. Set `DASHBOARD_USER_TYPE=admin` in environment variables

**Note**: The `write` permission is **required** for admin features, which include:
- Starting and stopping services
- Deleting services
- Viewing live service logs with filtering
- All read operations available in viewer mode

**Warning**: Only use admin mode with users you trust, as it grants full control over your Coolify services.

### Step 6: Setup 2FA (One-Time Only)

After deployment, setup Two-Factor Authentication. **This can only be done once!**

1. Check if setup is available:
   ```bash
   curl https://dashboard.kalayciburak.com.tr/api/auth/2fa/status
   # Response: {"setupCompleted": false, "canSetup": true}
   ```

2. Send a POST request to `/api/auth/2fa/setup` with your admin credentials:
   ```bash
   curl -X POST https://dashboard.kalayciburak.com.tr/api/auth/2fa/setup \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"your_password"}'
   ```

2. The response will include a QR code in the `qrCode` field. To view it:
   - Copy the entire `qrCode` value (starts with `data:image/png;base64,...`)
   - Paste it into your browser's URL bar
   - Press Enter to display the QR code image

3. Scan the displayed QR code with an authenticator app:
   - **Google Authenticator** (iOS/Android)
   - **Microsoft Authenticator** (iOS/Android) - Shows logo
   - **Authy** (iOS/Android/Desktop) - Shows logo
   - **1Password** (Premium feature)

4. Save the secret in a secure location as backup

### Resetting/Regenerating 2FA

If you need to reset or regenerate your 2FA setup (e.g., lost authenticator app access, compromised secret, or want to use a different device), follow these steps:

#### Why Manual Reset?

The dashboard **does not** provide a UI for resetting 2FA for security reasons. This prevents unauthorized users from regenerating 2FA codes even if they gain access to your dashboard. The reset process requires server-level access, ensuring maximum security.

#### Reset Process

**1. Stop the Application**

First, stop your running application:

```bash
# If running locally
npm stop

# If using Docker
docker stop coolify-dashboard

# If on Coolify
# Use Coolify UI to stop the application
```

**2. Delete the 2FA State File**

This file tracks whether 2FA setup has been completed:

```bash
# Navigate to server directory
cd server

# Delete the state file
rm .2fa-state.json

# If using Docker/Coolify, access the container:
docker exec -it coolify-dashboard rm /app/server/.2fa-state.json
```

**3. Generate a New 2FA Secret**

Create a new secret key:

```bash
# If running locally
cd server
npm run generate-2fa

# If using Docker, generate manually:
node -e "console.log(require('speakeasy').generateSecret({length: 32}).base32)"
```

Copy the generated secret (it looks like: `JBSWY3DPEHPK3PXP`)

**4. Update Environment Variables**

Update your `.env` file or environment configuration:

```env
ADMIN_2FA_SECRET=YOUR_NEW_SECRET_HERE
```

**On Coolify:**
1. Go to your application settings
2. Navigate to **Environment Variables**
3. Update `ADMIN_2FA_SECRET` with the new value
4. Save changes

**5. Restart the Application**

```bash
# If running locally
npm run dev

# If using Docker
docker restart coolify-dashboard

# If on Coolify
# Use Coolify UI to restart/deploy the application
```

**6. Setup 2FA Again**

After restart, follow [Step 6](#step-6-setup-2fa-one-time-only) to complete the new 2FA setup:

```bash
curl -X POST https://dashboard.kalayciburak.com.tr/api/auth/2fa/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

Scan the new QR code with your authenticator app.

**7. Remove Old Entry from Authenticator App**

**Important**: Don't forget to delete the old "Coolify Dashboard" entry from your authenticator app, as it will no longer work with the new secret.

#### Quick Reference

| Step | Action | Command/Location |
|------|--------|------------------|
| 1 | Stop Application | `docker stop coolify-dashboard` or Coolify UI |
| 2 | Delete State File | `rm server/.2fa-state.json` |
| 3 | Generate New Secret | `npm run generate-2fa` or `node -e "..."` |
| 4 | Update Env Var | Edit `.env` or Coolify Environment Variables |
| 5 | Restart App | `docker restart` or Coolify Deploy |
| 6 | Setup 2FA | POST to `/api/auth/2fa/setup` |
| 7 | Update Authenticator | Remove old entry, scan new QR |

### Step 7: Deploy

- Save the configuration
- Click **"Deploy"** to start the application
- The dashboard will be available at your configured domain

---

## Screenshots

### Login Screen

![Login Screen](https://raw.githubusercontent.com/kalayciburak/coolify-dashboard/master/docs/screenshots/1.png)

### Two-Factor Authentication

![Two-Factor Authentication](https://raw.githubusercontent.com/kalayciburak/coolify-dashboard/master/docs/screenshots/2.png)

### Application Overview

![Application Overview](https://raw.githubusercontent.com/kalayciburak/coolify-dashboard/master/docs/screenshots/3.png)

### Real-time log monitoring with filtering

![Real-time log monitoring with filtering](https://raw.githubusercontent.com/kalayciburak/coolify-dashboard/master/docs/screenshots/4.png)

### Services Overview

![Services Overview](https://raw.githubusercontent.com/kalayciburak/coolify-dashboard/master/docs/screenshots/5.png)

### Services Details

![Services Details](https://raw.githubusercontent.com/kalayciburak/coolify-dashboard/master/docs/screenshots/6.png)

### Database Configuration

![Database Details](https://raw.githubusercontent.com/kalayciburak/coolify-dashboard/master/docs/screenshots/7.png)

---

## Environment Variables

| Variable              | Description                                                       | Example                                 | Required | Default      |
| --------------------- | ----------------------------------------------------------------- | --------------------------------------- | -------- | ------------ |
| `ADMIN_USERNAME`      | Dashboard administrator username                                  | `admin`                                 | Yes      | -            |
| `ADMIN_PASSWORD`      | Dashboard administrator password                                  | `secure_password`                       | Yes      | -            |
| `ADMIN_2FA_SECRET`    | Two-Factor Authentication secret (Base32 encoded)                 | Generate using `npm run generate-2fa`   | Yes      | -            |
| `JWT_SECRET`          | Secret key for JWT token generation                               | `random_secret_key`                     | Yes      | -            |
| `ALLOWED_ORIGINS`     | CORS allowed origins (comma-separated for multiple)               | `https://dashboard.kalayciburak.com.tr` | Yes      | -            |
| `COOLIFY_BASE_URL`    | Your Coolify instance base URL                                    | `https://coolify.kalayciburak.com.tr`   | Yes      | -            |
| `COOLIFY_TOKEN`       | Coolify API token (read+read:sensitive for viewer, write for admin) | `your_api_token`                     | Yes      | -            |
| `DASHBOARD_USER_TYPE` | User access level: `viewer` (read-only) or `admin` (full control) | `admin` or `viewer`                   | No       | `viewer`     |
| `NODE_ENV`            | Environment mode: `development` disables 2FA for easier testing   | `development` or `production`           | No       | `production` |

---

## Motivation

While using Coolify, I found myself constantly clicking through each application and service individually just to view their URLs and basic information. This repetitive process became tedious when managing multiple resources. I thought, "Why not build a simple, elegant solution that displays everything at a glance?" This dashboard was born from that need—a centralized view to monitor all resources efficiently. If others find it useful too, that's even better.

---

## Features

- **Two-Factor Authentication (2FA)**: Enhanced security with TOTP-based authentication
- **Role-Based Access Control**: Viewer mode (read-only) and Admin mode (full control)
- **Admin Service Management**:
  - Start and stop services with one click
  - Delete services directly from the dashboard
  - View live service logs with real-time streaming
  - Filter logs with keyword search
  - Auto-scroll toggle for log viewing
  - Real-time action loading states with elapsed time indicators
  - Visual feedback with animated borders and icons
  - Modern glassmorphism status banner with real-time elapsed time display
  - Localized time format (shows "1d 30s" in Turkish, "1m 30s" in English)
- **Intelligent State Management**:
  - **Zustand Store**: Lightweight, centralized state management
  - **Adaptive Polling**: Smart polling intervals (5s → 30s) for resource efficiency
  - **Optimistic Updates**: Instant UI feedback before API confirmation
  - **Silent Background Sync**: Updates data without disrupting user experience
  - **Action-Specific Loading**: Per-resource, per-action loading states
  - **Auto-Cleanup**: Prevents memory leaks with proper interval cleanup
- **Sound Effects System**: Subtle audio feedback for button interactions with toggle control in bottom-right corner
- **Multi-language Support**: Seamless switching between English and Turkish
- **Responsive Design**: Modern UI optimized for desktop and mobile devices
- **Real-time Monitoring**: Track resource status and health in real-time
- **Secure Authentication**: JWT-based authentication with secure token management
- **Resource Monitoring**: Monitor applications, services, and databases
- **Modern Tech Stack**: Built with React 19, Zustand, Tailwind CSS 4, and Express.js

---

## Project Structure

```
coolify-dashboard/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state management
│   │   ├── api/            # API client services
│   │   ├── services/       # Business logic layer
│   │   ├── utils/          # Utility functions
│   │   └── i18n/           # Internationalization (EN/TR)
├── server/                 # Express backend application
│   ├── routes/             # API route definitions
│   ├── middleware/         # Custom middleware
│   ├── services/           # Backend services
│   └── utils/              # Backend utilities
└── Dockerfile              # Docker configuration
```

---

## Development

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Git

### Local Setup

```bash
# Clone the repository
git clone https://github.com/kalayciburak/coolify-dashboard.git

# Navigate to project directory
cd coolify-dashboard

# Install dependencies
npm install

# Create server/.env file with required variables
# See "Environment Variables" section below for all options

# Start development server (with 2FA disabled)
NODE_ENV=development npm run dev
```

### Development Mode (2FA Bypass)

For easier local development, you can disable Two-Factor Authentication by setting `NODE_ENV=development`:

```bash
# Linux/macOS
NODE_ENV=development npm run dev

# Windows (PowerShell)
$env:NODE_ENV="development"; npm run dev

# Windows (CMD)
set NODE_ENV=development && npm run dev
```

**Important Notes:**
- 2FA is **automatically disabled** when `NODE_ENV=development` is set
- In production, **never** set `NODE_ENV=development` as this bypasses 2FA security
- Without `NODE_ENV=development`, 2FA is always required (default production behavior)
- You can also add `NODE_ENV=development` to your `server/.env` file for persistent dev mode

### Available Scripts

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `npm run dev`    | Start both client and server in development mode |
| `npm run build`  | Build frontend for production                    |
| `npm run start`  | Start production server                          |
| `npm run lint`   | Run ESLint code quality checks                   |
| `npm run format` | Format code using Prettier                       |

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Guidelines

- Follow the existing code style and conventions
- Write clear and descriptive commit messages
- Add tests for new features
- Update documentation when necessary
- Ensure all tests pass before submitting PR

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

For bug reports, feature requests, or questions, please open an issue on [GitHub](https://github.com/kalayciburak/coolify-dashboard/issues).
