# Anton Grid - GitHub Bot

A GitHub bot built with Hono and Octokit that can interact with GitHub repositories. Deployed on Railway.

## Features

- Responds to pull request events
- Handles GitHub App installation
- Secure webhook handling
- Bot commands via comments:
  - `@bot review` - Request a code review
  - `@bot check` - Run automated checks
  - `@bot help` - Show help message

## Setup

1. Create a GitHub App in your GitHub account settings:

   - Set the webhook URL to your Railway deployment URL + `/github`
   - Enable the following permissions:
     - Repository permissions:
       - Issues: Read & Write
       - Pull requests: Read & Write
       - Contents: Read
     - Subscribe to events:
       - Pull requests
       - Issue comments
       - Installation

2. Set up the following environment variables in Railway:

   - `GITHUB_APP_ID`: Your GitHub App ID
   - `GITHUB_WEBHOOK_SECRET`: Your webhook secret
   - `GITHUB_PRIVATE_KEY`: Your app's private key (PEM format)
   - `PORT`: Server port (default: 3000)

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

The bot currently handles:

- Installation events (created/deleted)
- Pull request opened events
- PR review submissions
- Issue comments (bot commands)

To add more functionality, modify the webhook handlers in `src/webhook.ts`.

## Testing Locally

1. Use a tool like [ngrok](https://ngrok.com/) to expose your local server:

   ```bash
   ngrok http 3000
   ```

2. Update your GitHub App's webhook URL to your ngrok URL + `/github`
3. Create a test repository and install your app
4. Create a test PR to trigger the bot
5. Try the bot commands in PR comments

## Deployment to Railway

1. Create a new project in Railway
2. Connect your GitHub repository
3. Add the required environment variables
4. Deploy!

The bot will automatically start and begin listening for GitHub events.

## Contributing

Feel free to submit issues and pull requests!
