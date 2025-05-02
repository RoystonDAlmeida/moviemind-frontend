# 🎬 MovieMind - Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Project Status: Active](https://img.shields.io/badge/status-active-success.svg)](-) <!-- Or Inactive, Maintenance -->

**Welcome to the frontend interface for MovieMind, a movies recommendation app! Browse movies, get recommendations, add favorites to your library and manage your account.**

---

**Table of Contents**

- [🎬 MovieMind - Frontend](#-moviemind---frontend)
  - [Overview](#overview)
  - [Features ✨](#features-)
  - [Live Demo / Screenshots 📸](#live-demo--screenshots-)
  - [Backend Repository ⚙️](#backend-repository-️)
  - [Tech Stack 🛠️](#tech-stack-️)
  - [Local Setup and Installation 🚀](#local-setup-and-installation-)
  - [Deployment Note ☁️](#deployment-note-️)
  - [Contributing 🤝](#contributing-)
  - [License 📜](#license-)

---

## Overview

This repository contains the frontend implementation for MovieMind. It provides a user interface for browsing movies, getting recommendations, adding favorites to user library and managing user accounts.

## Features ✨

*   👤 **User Authentication:** Secure Sign Up & Sign In powered by Clerk.
*   🎬 **Movie Catalog:** Browse an extensive collection of movies.
*   💡 **Recommendations:** Discover movies tailored to your taste (powered by the backend).
*   ℹ️ **Detailed Views:** Access ratings, genres and more.
*   ⭐ **Filtering:** Filter by either genres or languages.

## Live Demo / Screenshots 📸


## Backend Repository ⚙️

The backend logic, including the recommendation engine, database interactions, and core API, is maintained in a separate repository. You will need to have the backend service running for this frontend application to function correctly.

**Backend Repository:** [Link to your backend repository here] (e.g., `https://github.com/RoystonDAlmeida/moviemind-backend.git`)

*➡️ Please refer to the backend repository's README for its setup instructions.*

## Tech Stack 🛠️

*   **Framework/Library:** `React`
*   **Authentication:** `Clerk`
*   **Styling:** `Tailwind CSS`
*   **Build Tool:** `Vite`
*   **Package Manager:** `npm`

## Local Setup and Installation 🚀

Follow these steps to get the frontend running on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:RoystonDAlmeida/moviemind-frontend.git 
    cd moviemind-frontend/
    ```

2.  **Install dependencies:**
    <details>
      <summary>Click to view installation commands</summary>

      Choose the command corresponding to your package manager:
      ```bash
      # Using npm
      npm install

      # Using yarn
      yarn install

      # Using pnpm
      pnpm install
      ```
    </details>

3.  **Set up Environment Variables:**
    This project requires environment variables for configuration, especially for Clerk and the backend API URL.
    *   Create a `.env` file in the root directory of the project (`moviemind-frontend/`).
    *   **Suggestion:** Create a `.env` file in your repository root with the structure below.
    *   Add the necessary environment variables to your `.env` file:

        <details>
          <summary>Click to view example .env structure</summary>

          ```plaintext
          # Clerk API Keys (Get these from your Clerk dashboard - https://dashboard.clerk.dev)

          # Ensure keys match your build tool's prefix
          VITE_CLERK_PUBLISHABLE_KEY = pk_test_YOUR_PUBLISHABLE_KEY

          # Backend API URL (Point this to where your local backend is running)
          VITE_API_BASE_URL = http://localhost:3000/
          ```
        </details>

    *   **Important:** Ensure your Clerk keys are configured for development/localhost usage in the Clerk dashboard.

4.  **Ensure the Backend is Running:**
    ▶️ Start your backend server. Refer to the [backend repository's setup instructions](https://github.com/RoystonDAlmeida/moviemind-backend#local-setup-and-installation) for details. The frontend needs to communicate with it.

5.  **Run the Development Server:**
    <details>
      <summary>Click to view development server commands</summary>

      ```bash
      # Using npm
      npm run dev

      # Using yarn
      yarn dev

      # Using pnpm
      pnpm dev
      ```
    </details>

    The application should now be running, typically at `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA), but check your terminal output for the exact address.

## Deployment Note ☁️

Deploying this frontend to production platforms using Clerk's standard setup might require a custom domain name due to their production instance policies. This repository is primarily maintained for local development and showcasing via GitHub.

## Contributing 🤝

Contributions are welcome! If you have suggestions or find bugs, please open an issue or submit a pull request.

## License 📜

This project is licensed under the MIT License.