# Ruck

---

**Note:** This code was 100% generated with AI (mainly Claude Code) as an experiment.

---

AI-powered code reviews for GitLab Merge Requests and local git branches using various LLM providers.

## Features

- 🤖 **Multi-LLM Support**: Works with Claude, Gemini, OpenAI, ChatGPT, and Ollama (enhanced with text-to-JSON conversion)
- 🌍 **Dual Mode Support**: Review GitLab Merge Requests OR local git branch changes
- 🔍 **Smart Detection**: Automatically detects available LLM binaries and git branches
- 📝 **Comprehensive Reviews**: Provides detailed code analysis with line-specific comments
- 🛡️ **Conflict Prevention**: Checks for unresolved discussions before proceeding (GitLab mode)
- 🎯 **Interactive CLI**: Professional command-line interface with helpful prompts
- 📊 **Multiple Output Formats**: HTML reports, CLI output, or direct GitLab posting
- ⚡ **Fast Setup**: Simple installation and configuration

## Installation

### Global Installation (Recommended)

```bash
# Install globally via npm
npm install -g @mikestreety/ruck

# Now use 'ruck' command anywhere
ruck --help
```

### NPX Usage (No Installation)

```bash
npx @mikestreety/ruck
```

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ruck
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run locally**:
   ```bash
   node ./bin/run.js
   ```

### Prerequisites

1. **Node.js**: Version 16 or higher
2. **Git Repository**: For local mode, run from within a git repository
3. **GitLab Access Token**: Personal access token with appropriate permissions (GitLab mode only)
4. **LLM CLI Tool**: At least one of the following:
   - [Claude CLI](https://claude.ai/code)
   - [Gemini CLI](https://ai.google.dev/)
   - [OpenAI CLI](https://platform.openai.com/docs/guides/cli)
   - [Ollama](https://ollama.ai/) (for local models)
   - [ChatGPT CLI](https://www.npmjs.com/package/chatgpt-cli)
   - [GitHub CLI](https://cli.github.com/) (for Copilot)

### Configuration

Create a `.ruckconfig` file in your home directory for centralized configuration:

```bash
# ~/.ruckconfig
GITLAB_PRIVATE_TOKEN=your_gitlab_token_here
DEFAULT_LLM=claude
DEFAULT_OUTPUT=html
```

**Note**: Local mode doesn't require GitLab token configuration.

4. **Verify LLM availability**:
   ```bash
   ruck list-llms
   ```

## Usage

This tool uses [oclif](https://oclif.io/) as its CLI framework, providing a professional command-line interface with built-in help, argument validation, and consistent behavior. The interface now features enhanced user experience with Inquirer.js for interactive prompts and Ora for elegant loading animations.

### Command Structure

```bash
# Fully interactive mode (prompts for review mode, then appropriate options)
ruck

# Interactive mode with command
ruck review

# Local branch review (compare current branch with base)
ruck review --mode local

# GitLab MR review
ruck review <merge-request-url> --mode gitlab

# Specify all options for local review
ruck review my-feature-branch --mode local --base main --llm claude --output html

# Specify all options for GitLab review
ruck review <merge-request-url> --mode gitlab --llm claude --output gitlab

# List available LLMs
ruck list-llms

# Configure setup
ruck setup
```

### All Available Options

```bash
ruck review [url_or_branch] [options]

Arguments:
  url_or_branch          GitLab MR URL or local branch name (optional, will prompt if missing)

Options:
  -m, --mode <mode>      Review mode: local (compare branches) or gitlab (MR review)
  -b, --base <branch>    Base branch for local comparison (default: auto-detect)
  -l, --llm <provider>   LLM provider: claude, gemini, openai, ollama, chatgpt
  -o, --output <format>  Output format: gitlab (GitLab mode), html, cli
  --list-llms            List available LLM providers and exit
  -h, --help             Display help information
```

### Usage Examples

#### 1. Fully Interactive Mode
```bash
ruck
# Prompts for:
# - Review mode (local/gitlab)
# - Branch information OR GitLab MR URL
# - LLM provider (from available options)
# - Output format (html/cli for local, gitlab/html/cli for GitLab)
```

#### 2. Local Branch Review Examples

**Compare current branch with auto-detected base:**
```bash
ruck review --mode local
# Automatically detects current branch and suggests base branch (main/master/develop)
```

**Compare specific branch with base:**
```bash
ruck review my-feature-branch --mode local --base main
# Compares my-feature-branch with main branch
```

**Complete local review with all options:**
```bash
ruck review --mode local --base main --llm claude --output html
# Generates HTML report comparing current branch with main using Claude
```

**Local review with CLI output:**
```bash
ruck review my-feature --mode local --llm gemini --output cli
# Shows linter-style output in console
```

#### 3. GitLab MR Review Examples

**Interactive GitLab review:**
```bash
ruck review --mode gitlab
# Prompts for GitLab MR URL, LLM, and output format
```

**Direct GitLab MR URL:**
```bash
ruck review https://gitlab.example.com/project/repo/-/merge_requests/123 --mode gitlab
# Prompts for LLM and output format
```

**Complete GitLab review with all options:**
```bash
ruck review https://gitlab.example.com/project/repo/-/merge_requests/123 --mode gitlab --llm claude --output gitlab
# Posts comments directly to GitLab MR
```

**Generate HTML report from GitLab MR:**
```bash
ruck review <gitlab-url> --mode gitlab --llm openai --output html
# Downloads MR data and generates offline HTML report
```

#### 4. Output Format Examples

**HTML Report (recommended for local reviews):**
```bash
ruck review --mode local --output html
# Generates beautiful standalone HTML file: code-review-[timestamp].html
```

**CLI Output (great for CI/CD):**
```bash
ruck review --mode local --output cli
# Shows ESLint-style output: file:line label: message
```

**GitLab Posting (GitLab mode only):**
```bash
ruck review <gitlab-url> --mode gitlab --output gitlab
# Posts line-specific comments and summary to the MR
```

#### 5. LLM Provider Examples
```bash
# Use Claude (recommended for cloud)
ruck review --mode local --llm claude

# Use Gemini
ruck review --mode local --llm gemini

# Use OpenAI (requires API key)
ruck review --mode local --llm openai

# Use local Ollama (recommended for local models)
ruck review --mode local --llm ollama

# Use ChatGPT (requires TOKEN env var)
ruck review --mode local --llm chatgpt
```

#### 6. Check Available Providers
```bash
ruck list-llms
# Output:
# Available LLM providers:
#   - claude
#   - gemini
#   - openai (if installed)
#   - ollama (if installed)
```

### Command Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `[url_or_branch]` | Argument | *prompted* | GitLab MR URL or local branch name |
| `-m, --mode <mode>` | Option | *prompted* | Review mode: `local` or `gitlab` |
| `-b, --base <branch>` | Option | *auto-detect* | Base branch for local comparison |
| `-l, --llm <provider>` | Option | *prompted* | LLM provider: `claude`, `gemini`, `openai`, `ollama`, `chatgpt` |
| `-o, --output <format>` | Option | *prompted* | Output format: `gitlab` (GitLab mode only), `html`, `cli` |
| `--list-llms` | Flag | - | List available LLM providers and exit |
| `-h, --help` | Flag | - | Display help information |
| `-V, --version` | Flag | - | Display version number |

### Interactive Prompts

The tool will interactively prompt for missing required information:

1. **Review Mode Prompt**: If no `--mode` specified, shows options:
   - `local` - Compare local git branches (default)
   - `gitlab` - Review GitLab Merge Request

2. **Branch Selection** (Local mode):
   - **Current Branch**: Automatically detected
   - **Base Branch**: Auto-suggests main/master/develop, allows custom input

3. **URL Prompt** (GitLab mode): If no URL provided as argument

4. **LLM Provider Prompt**: If no `--llm` specified, shows numbered list of available providers:
   - Automatically detects which LLM CLI tools are installed
   - Shows default option (first available)
   - Allows selection by number

5. **Output Format Prompt**: If no `--output` specified, shows appropriate options:
   - **Local mode**: `html` (default), `cli`
   - **GitLab mode**: `gitlab` (default), `html`, `cli`

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITLAB_PRIVATE_TOKEN` | GitLab personal access token | Yes |

### Supported LLM Providers

The tool automatically detects which LLM CLI tools are installed:

| Provider | CLI Command | Status | Installation |
|----------|-------------|--------|--------------|
| Claude | `claude` | ✅ Fully supported | [Claude CLI Setup](https://claude.ai/code) |
| Gemini | `gemini` | ✅ Fully supported | [Gemini CLI Setup](https://ai.google.dev/) |
| OpenAI | `openai` | ✅ Requires API key | [OpenAI CLI Setup](https://platform.openai.com/docs/guides/cli) |
| ChatGPT | `chatgpt` | ✅ Requires TOKEN env | `npm install -g chatgpt-cli` |
| Ollama | `ollama` | ✅ Enhanced support | [Ollama Setup](https://ollama.ai/) - **Recommended for local LLMs** |

#### Compatibility Notes
- **Ollama**: Enhanced with automatic text-to-JSON conversion for seamless integration
- **OpenAI**: Requires `OPENAI_API_KEY` environment variable
- **ChatGPT**: Requires `TOKEN` environment variable with OpenAI API key
- **Local LLMs**: Use Ollama for best compatibility with various models (Llama, Phi, Gemma, etc.)

#### Unsupported LLMs
- **Llama CLI** (`llama-cli`): Incompatible with stdin-based architecture, designed for interactive use
- **GitHub Copilot**: Not designed for code review, only for command suggestions

## Complete Workflow

### Local Mode Workflow

### 1. Input Collection
- **Review Mode**: Local branch comparison
- **Branch Info**: Current branch (auto-detected) and base branch (auto-suggested)
- **LLM Provider**: Prompted from available CLI tools, or specified with `--llm`
- **Output Format**: Prompted for HTML or CLI (GitLab posting not available)

### 2. Validation & Setup
- Validates current directory is a git repository
- Detects current branch and suggests appropriate base branch
- Detects available LLM CLI tools on the system

### 3. Local Repository Analysis
- Generates diff between current branch and base branch
- Identifies changed files between branches
- Reads full file contents for better context

### 4. AI-Powered Review
- Sends code diff and context to selected LLM
- Uses Conventional Comments format for structured feedback
- Focuses on critical issues: bugs, security, performance

### 5. Output Generation
- **HTML Output**: Generates beautiful standalone report
- **CLI Output**: Shows linter-style console output

### GitLab Mode Workflow

### 1. Input Collection
- **Review Mode**: GitLab Merge Request review
- **MR URL**: Provided as argument or prompted interactively
- **LLM Provider**: Prompted from available CLI tools, or specified with `--llm`
- **Output Format**: Prompted for GitLab, HTML, or CLI

### 2. Validation & Setup
- Validates GitLab private token is set
- Checks for unresolved discussions on the MR
- Detects available LLM CLI tools on the system

### 3. Repository Analysis
- Clones the source branch to a temporary directory
- Retrieves the MR diff and changed files list
- Reads full file contents for better context

### 4. AI-Powered Review
- Sends code diff and context to selected LLM
- Uses Conventional Comments format for structured feedback
- Focuses on critical issues: bugs, security, performance

### 5. Output Generation
Based on selected format:

**GitLab Output:**
- Posts line-specific comments to MR
- Adds summary comment with overall assessment
- Shows real-time progress in console

**HTML Output:**
- Generates standalone HTML report file
- Professional Playwright-inspired styling
- Color-coded labels and summary statistics
- Self-contained file for sharing/archiving

**CLI Output:**
- Shows linter-style console output
- Format: `file:line label: message`
- Summary statistics at the end
- Perfect for CI/CD integration

## Output Formats

The tool supports three output formats:

### GitLab (Default)
- **Line-specific comments**: Posted directly on the relevant lines
- **Summary comment**: Overall review summary posted to the MR
- **Console output**: Real-time progress and results

### HTML Report
- **Professional styling**: Playwright-inspired design with modern UI
- **Color-coded labels**: Visual distinction for different comment types
- **Summary statistics**: Overview of comments, blocking issues, and praise
- **Standalone file**: Self-contained report that can be shared or archived

### CLI Output
- **Linter-style format**: Similar to ESLint output with `file:line label: message`
- **Summary statistics**: Quick overview of issues found
- **Console-friendly**: Perfect for CI/CD pipelines and terminal workflows

## LLM Compatibility & Architecture

### How LLM Integration Works

Ruck integrates with LLM providers through their CLI tools using a standard architecture:

1. **Process Spawning**: Spawns the LLM CLI process (e.g., `claude`, `gemini`, `ollama`)
2. **Stdin Communication**: Sends the code review prompt via stdin
3. **Output Parsing**: Expects structured JSON output for processing
4. **Timeout Handling**: Manages process timeouts and error handling

### Compatible LLM Requirements

For an LLM to work with Ruck, it must:
- ✅ Accept input via stdin (pipe support)
- ✅ Process prompts in non-interactive mode
- ✅ Output structured data (JSON preferred)
- ✅ Handle timeouts gracefully
- ✅ Return consistent response format

### Why Some LLMs Don't Work

#### Llama CLI (`llama-cli`)
- ❌ **Interactive Design**: Built for chat-style interactions
- ❌ **Stdin Issues**: EPIPE errors when reading from stdin
- ❌ **Complex Arguments**: Requires model files and complex setup
- ❌ **Output Format**: Doesn't provide structured JSON output

#### GitHub Copilot (`gh copilot`)
- ❌ **Wrong Purpose**: Designed for shell command suggestions
- ❌ **Limited Scope**: Not built for code review analysis
- ❌ **API Mismatch**: Different use case than code review

### Ollama Enhancement

Ollama receives special treatment with enhanced text-to-JSON conversion:
- 📝 **Text Processing**: Converts natural language responses to JSON
- 🔍 **Content Extraction**: Identifies file references, line numbers, suggestions
- 📊 **Structure Creation**: Builds proper review objects with comments and ratings
- 🎯 **Fallback Handling**: Graceful handling of various text formats

## Troubleshooting

### Common Issues

#### Local Mode Issues

1. **"Current directory is not a git repository"**:
   - Run the command from within a git repository
   - Ensure you have `.git` directory in your project

2. **"No differences found between branches"**:
   - Check that your current branch has commits different from the base branch
   - Use `git log base-branch..current-branch` to verify differences

3. **"Failed to get current branch"**:
   - Ensure you're not in a detached HEAD state
   - Switch to a proper branch with `git checkout branch-name`

#### GitLab Mode Issues

4. **"No LLM binaries found"**:
   - Install at least one LLM CLI tool
   - Ensure the CLI is in your system PATH
   - Run `npm start list-llms` to verify detection

5. **"GITLAB_PRIVATE_TOKEN not set"**:
   - Create a `.env` file with your GitLab token
   - Ensure the token has appropriate API permissions

6. **"Failed to parse GitLab URL"**:
   - Verify the MR URL format: `https://gitlab.example.com/group/project/-/merge_requests/123`
   - Ensure the MR exists and is accessible

7. **"Unresolved discussions found"**:
   - Resolve all discussion threads in the MR before running the review
   - This prevents duplicate or conflicting feedback

#### General Issues

8. **"Invalid output format for local review"**:
   - Local reviews only support `html` and `cli` output formats
   - GitLab posting is not available for local reviews

### Debug Mode

For troubleshooting, check the console output which includes:
- LLM detection results
- Git operations status
- API call responses
- File processing progress

## Publishing

This package is automatically published to npm when a new release is created on GitHub.

### For Maintainers

1. **Setup NPM Token**: Add your npm token to GitHub repository secrets as `NPM_TOKEN`
2. **Create Release**: Create a new release on GitHub with a version tag (e.g., `v1.0.1`)
3. **Automatic Publishing**: The GitHub Action will automatically publish to npm

### Manual Publishing (Alternative)

```bash
# Login to npm (if not already)
npm login

# Publish with 2FA
npm publish --access public --otp=123456
```

## Contributing

This project follows a strict development workflow documented in `CLAUDE.md`. All feature development must:

1. Create a dedicated feature branch
2. Implement the requested functionality
3. **Test using the tool on its own codebase** (dogfooding)
4. Implement ALL feedback from self-review
5. Update documentation as needed
6. Create comprehensive commit with co-authorship
7. Push and prepare for merge to main

### For Human Contributors
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the linter: `npm run lint`
5. Test your changes thoroughly
6. Commit your changes
7. Push to your fork
8. Create a Pull Request

### Development Workflow
See `CLAUDE.md` for detailed development standards and mandatory testing procedures.

## License

[MIT License](LICENSE)

## Security

- The tool only reads repository data and posts comments
- No sensitive data is stored or transmitted beyond GitLab APIs
- LLM providers may have their own data handling policies
- Review your organization's policies before use

---

**Note**: This tool is designed for code review assistance. Always review AI-generated feedback before taking action, as AI suggestions may not always be appropriate for your specific context or requirements.
