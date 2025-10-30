# Jira Standup Report Generator

Automatically generates a daily standup report from your Jira tasks and opens it in Notepad++.

## Features

- Fetches all tasks assigned to you from Jira
- Filters "Done" tasks to only show current week
- Generates markdown file with:
  - Clickable Jira links
  - Status-specific emojis (💻 🔍 ✅ etc.)
  - Color-coded status text (Teams-compatible)
  - Story point values
- Saves to organized date structure: `./dailies/YYYY/MM/DD_jira-tasks.md`
- Automatically opens result in Notepad++

## Prerequisites

- Docker Desktop installed and running
- Notepad++ installed at `C:\Program Files\Notepad++\notepad++.exe`
- Jira API token (see setup below)

## Setup

### 1. Get Your Jira API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "Standup Script")
4. Copy the token (you won't see it again!)

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env` and add your credentials:

```env
JIRA_EMAIL=your.email@fnba.com
JIRA_API_TOKEN=your_token_here
JIRA_DOMAIN=fnba.atlassian.net
TZ=America/New_York
```

**Important**: Never commit `.env` to git! It contains your credentials.

### 3. Build (First Time Only)
```bash
docker-compose build
```

## Usage

### Windows (Easy Way)

Simply double-click `run.bat`

The script will:
1. Run the Docker container
2. Generate your standup report
3. Open it in Notepad++

### Manual Docker Commands

If you prefer not to use the batch file:

```bash
# Using Docker Compose
docker-compose up

# Using Docker directly
docker build -t jira-standup .
docker run --rm -v "%cd%\dailies:/output" ^
  -e JIRA_EMAIL=your.email@fnba.com ^
  -e JIRA_API_TOKEN=your_token ^
  -e JIRA_DOMAIN=fnba.atlassian.net ^
  jira-standup
```

### Output Format

Generated markdown looks like:

```markdown
# Jira Tasks

[PROJ-123](https://fnba.atlassian.net/browse/PROJ-123) **Fix login bug**: 🔍 Review (5)
[PROJ-124](https://fnba.atlassian.net/browse/PROJ-124) **Add new feature**: 💻 Implement (8)
[PROJ-125](https://fnba.atlassian.net/browse/PROJ-125) **Update docs**: ✅ Done (2)
```

Perfect for copying into Teams chat!

## Status Emojis

- 📝 Selected for Development
- 📋 Spec Review
- 💻 Implement
- 👀 Ready to Review
- 🔍 Review
- ✔️ Ready to Validate
- ✅ Validate
- 🚀 Ready for Staging
- 🎯 Staging
- ✅ Done

## Troubleshooting

### Docker not found

Make sure Docker Desktop is installed and running.

### Authentication failed

- Verify your API token is correct
- Check that your email matches your Jira account
- Ensure the token hasn't expired

### Notepad++ not opening

Update the path in `run-standup.bat` if Notepad++ is installed elsewhere:

```batch
start "" "C:\Path\To\Your\notepad++.exe" "%OUTPUT_FILE%"
```

### No tasks found

- Check that you have tasks assigned in Jira
- Verify the `JIRA_DOMAIN` is correct
- Remember: "Done" tasks only show from current week

## Customization

### Change Story Points Field

If your Jira uses a different custom field for story points, update line 83 in `standup.js`:

```javascript
fields: 'summary,status,customfield_XXXXX'  // Replace with your field ID
```

To find your field ID, check your Jira board settings or ask your Jira admin.

### Add More Statuses

Edit the `STATUS_EMOJIS` object in `standup.js` to add emojis for additional statuses.

## File Structure

```
jira-standup/
├── Dockerfile
├── docker-compose.yml
├── standup.js
├── package.json
├── run-standup.bat
├── .env.example
├── .env (create this, don't commit!)
├── README.md
└── dailies/          (generated)
    └── 2025/
        └── 10/
            └── 28_jira-tasks.md
```

## Sharing with Team

Feel free to share this tool! Just remind people to:

1. Create their own `.env` file (never share tokens!)
2. Get their own Jira API token
3. Update `JIRA_EMAIL` with their email

## License

MIT