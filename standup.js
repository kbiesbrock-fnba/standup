const fs = require('fs');
const path = require('path');

// Configuration
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const DO_POST_IN_TEAMS = process.env.DO_POST_IN_TEAMS ?? false;
const JIRA_DOMAIN = process.env.JIRA_DOMAIN || 'fnba.atlassian.net';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/output';
const JIRA_API_URL = `https://${JIRA_DOMAIN}/rest/api/3/search/jql`;

// Status-specific emoji mapping
const STATUS_EMOJIS = {
  'selected for development': '📝',
  'spec review': '📋',
  'implement': '💻',
  'ready to review': '👀',
  'review': '🔍',
  'ready to validate': '✔️',
  'validate': '✅',
  'ready for staging': '🚀',
  'staging': '🎯',
  'done': '✅',
  'default': '⚪'
};

// Status category color mapping for HTML spans
const CATEGORY_COLORS = {
  'new': '#6B7280',           // Gray for "To Do"
  'indeterminate': '#3B82F6', // Blue for "In Progress"
  'done': '#10B981',          // Green for "Done"
  'default': '#9CA3AF'        // Gray default
};

// Validation
if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Error: JIRA_EMAIL and JIRA_API_TOKEN environment variables are required');
  process.exit(1);
}

// Create Basic Auth token
const authToken = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

async function main() {
  try {
    console.log(`📋 Fetching Jira tasks...`);
    
    const issues = await fetchIssues();
    console.log(`📊 Found ${issues.length} tasks`);
    
    const markdown = generateMarkdown(issues);
    const filePath = saveMarkdown(markdown);
    
    // Also output to console for verification
    console.log('\n--- Preview ---');
    console.log(markdown);
    
  } catch (error) {
    console.error('❌ Error generating standup report:', error.message);
    process.exit(1);
  }
}

main();

// Jira API helper
async function jiraFetch(params = {}) {
  const url = new URL(JIRA_API_URL);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
  const response = await fetch(url.toString(), {
	  method: 'GET',
    headers: {
      'Authorization': `Basic ${authToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jira API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

// Get current week's start date (Monday)
function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Format date for file path (YYYY/MM/DD)
function formatDatePath(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return { year, month, day };
}

// Fetch all issues assigned to the user
async function fetchIssues() {
  try {
    
    // JQL: Get all assigned issues, but for "Done" status only include this week
    const jql = `assignee = currentUser() AND (statusCategory != Done OR statusCategoryChangedDate >= startOfWeek())`;
    
    const data = await jiraFetch({
      jql: jql,
      fields: 'summary,status,customfield_10028',
      maxResults: '20'
    });
    
    return data.issues;
  } catch (error) {
    console.error('Error fetching issues:', error.message);
    throw error;
  }
}

// Get status emoji based on specific status name
function getStatusEmoji(statusName) {
  const status = statusName?.toLowerCase() || '';
  return STATUS_EMOJIS[status] || STATUS_EMOJIS.default;
}

// Get color based on status category
function getCategoryColor(statusCategory) {
  const category = statusCategory?.key?.toLowerCase() || 'default';
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
}

// Generate markdown with emoji indicators and colored status
function generateMarkdown(issues) {
  if (issues.length === 0) {
    return '# No tasks assigned\n';
  }

  let markdown = '';
  
  issues.forEach(issue => {
    const key = issue.key;
    const summary = issue.fields.summary;
    const status = issue.fields.status.name;
    const statusCategory = issue.fields.status.statusCategory;
    const storyPoints = issue.fields.customfield_10028 || 'N/A';
    const link = `https://${JIRA_DOMAIN}/browse/${key}`;
    
    const emoji = getStatusEmoji(status);
    const color = getCategoryColor(statusCategory);
    
    // Format: [KEY](link) **Summary**: emoji <colored status> (Points)
    //markdown += `[${key}](${link}) **${summary}**: ${emoji} *${status}* (${storyPoints})\n`;
    markdown += `[${key}] ${summary}: ${emoji} ${status} (${storyPoints})\n`;
  });
  
  return markdown;
}

// Save markdown to file
function saveMarkdown(markdown) {
  const now = new Date();
  const { year, month, day } = formatDatePath(now);
  
  const dirPath = path.join(OUTPUT_DIR, year + '', month + '');
  const fileName = `${year}${month}${day}_jira-tasks.md`;
  const filePath = path.join(dirPath, fileName);
  
  // Create directory structure if it doesn't exist
  fs.mkdirSync(dirPath, { recursive: true });
  
  // Write file
  fs.writeFileSync(filePath, markdown, 'utf8');
  
  console.log(`✅ Standup report generated: ${filePath}`);
  return filePath;
}