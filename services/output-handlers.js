import { writeFileSync } from 'node:fs';
import { postCommentToMergeRequest, postLineCommentToMergeRequest } from '../api/gitlab.js';
import { getReviewStatistics } from './review-processor.js';
import { extractCodeSnippet, parseFileContents, getFileExtension, getLanguageFromExtension } from './code-snippet-extractor.js';
import chalk from 'chalk';

function escapeHtml(text) {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll('\'', '&#39;');
}

export function generateHtmlReport(parsedReview, llmChoice, fileContext = null) {
	const stats = getReviewStatistics(parsedReview),
		fileContents = fileContext ? parseFileContents(fileContext) : new Map(),

		html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Review Report - ${llmChoice.toUpperCase()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .title { font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #0f172a; }
        .subtitle { color: #64748b; font-size: 14px; }
        .summary { background: white; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary h2 { font-size: 18px; margin-bottom: 16px; color: #0f172a; }
        .summary-text { line-height: 1.6; color: #334155; }
        .comments-section h2 { font-size: 18px; margin-bottom: 16px; color: #0f172a; }
        .comment { background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #e2e8f0; }
        .comment.issue { border-left-color: #ef4444; }
        .comment.suggestion { border-left-color: #3b82f6; }
        .comment.todo { border-left-color: #f59e0b; }
        .comment.question { border-left-color: #8b5cf6; }
        .comment.nitpick { border-left-color: #6b7280; }
        .comment.hidden { display: none; }
        .comment-header { display: flex; align-items: center; margin-bottom: 12px; }
        .file-path { font-family: 'SF Mono', Consolas, monospace; font-size: 14px; color: #059669; font-weight: 500; }
        .line-number { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-family: 'SF Mono', Consolas, monospace; font-size: 12px; margin-left: 12px; }
        .line-warning { color: #f59e0b; margin-left: 8px; cursor: help; }
        .comment-text { line-height: 1.6; color: #334155; }
        .label { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; margin-right: 8px; }
        .label.issue { background: #fef2f2; color: #dc2626; }
        .label.suggestion { background: #eff6ff; color: #2563eb; }
        .label.todo { background: #fffbeb; color: #d97706; }
        .label.question { background: #f3f4f6; color: #7c3aed; }
        .label.nitpick { background: #f9fafb; color: #4b5563; }
        .stats { display: flex; gap: 16px; margin-top: 16px; }
        .stat { background: #f8fafc; padding: 8px 16px; border-radius: 6px; text-align: center; cursor: pointer; transition: all 0.2s ease; border: 2px solid transparent; }
        .stat:hover { background: #e2e8f0; transform: translateY(-1px); }
        .stat.active { background: #dbeafe; border-color: #3b82f6; }
        .stat.inactive { background: #f1f5f9; opacity: 0.6; }
        .stat-number { font-size: 18px; font-weight: 600; color: #0f172a; }
        .stat-label { font-size: 12px; color: #64748b; margin-top: 2px; }
        .code-snippet { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-top: 12px; font-family: 'SF Mono', Consolas, monospace; font-size: 13px; overflow-x: auto; }
        .code-snippet-header { background: #f1f5f9; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; display: flex; justify-content: space-between; align-items: center; }
        .line-adjustment { font-size: 11px; color: #f59e0b; background: #fef3c7; padding: 2px 6px; border-radius: 3px; }
        .code-line { padding: 2px 12px; display: flex; border-left: 3px solid transparent; }
        .code-line.target { background: #fef3c7; border-left-color: #f59e0b; }
        .line-num { color: #9ca3af; min-width: 40px; margin-right: 12px; text-align: right; user-select: none; }
        .line-content { flex: 1; white-space: pre; color: #374151; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">Code Review Report</div>
            <div class="subtitle">Generated by ${llmChoice.toUpperCase()} • ${new Date().toLocaleString()}</div>
            <div class="stats">
                <div class="stat ${stats.issueCount > 0 ? 'active' : 'inactive'}" data-filter="issue" onclick="toggleFilter('issue')">
                    <div class="stat-number">${stats.issueCount}</div>
                    <div class="stat-label">Issues</div>
                </div>
                <div class="stat ${stats.suggestions > 0 ? 'active' : 'inactive'}" data-filter="suggestion" onclick="toggleFilter('suggestion')">
                    <div class="stat-number">${stats.suggestions}</div>
                    <div class="stat-label">Suggestions</div>
                </div>
                <div class="stat ${stats.todoCount > 0 ? 'active' : 'inactive'}" data-filter="todo" onclick="toggleFilter('todo')">
                    <div class="stat-number">${stats.todoCount}</div>
                    <div class="stat-label">TODOs</div>
                </div>
                <div class="stat ${stats.questionCount > 0 ? 'active' : 'inactive'}" data-filter="question" onclick="toggleFilter('question')">
                    <div class="stat-number">${stats.questionCount}</div>
                    <div class="stat-label">Questions</div>
                </div>
                <div class="stat ${stats.nitpickCount > 0 ? 'active' : 'inactive'}" data-filter="nitpick" onclick="toggleFilter('nitpick')">
                    <div class="stat-number">${stats.nitpickCount}</div>
                    <div class="stat-label">Nitpicks</div>
                </div>
                <div class="stat ${stats.noteCount > 0 ? 'active' : 'inactive'}" data-filter="note" onclick="toggleFilter('note')">
                    <div class="stat-number">${stats.noteCount}</div>
                    <div class="stat-label">Notes</div>
                </div>
            </div>
        </div>
        
        <div class="summary">
            <h2>Summary</h2>
            <div class="summary-text">${parsedReview.summary}</div>
        </div>
        
        <div class="comments-section">
            <h2>Detailed Comments</h2>
            ${parsedReview.comments.map((comment) => {
				const labelMatch = comment.comment.match(/^(\w+)(\s*\([^)]+\))?:/),
					label = labelMatch ? labelMatch[1] : 'note',
					commentText = comment.comment.replace(/^(\w+)(\s*\([^)]+\))?:\s*/, ''),

					// Get code snippet if file content is available
					fileContent = fileContents.get(comment.file);
				let codeSnippetHtml = '',
					snippet = null;

				if (fileContent && comment.line && comment.line > 0) {
					snippet = extractCodeSnippet(fileContent, comment.line, 2);
					if (snippet) {
						const extension = getFileExtension(comment.file),
							language = getLanguageFromExtension(extension);

						let adjustmentInfo = '';
						if (snippet.adjusted && snippet.adjustmentReason) {
							const confidenceText = snippet.confidence >= 0.8 ? 'high' : (snippet.confidence >= 0.6 ? 'medium' : 'low');
							adjustmentInfo = `<span class="line-adjustment" title="Original line ${snippet.originalTargetLine} → Line ${snippet.targetLine}. ${snippet.adjustmentReason}. Confidence: ${confidenceText}">⚠️ Line adjusted: ${snippet.adjustmentReason}</span>`;
						}

						codeSnippetHtml = `
                        <div class="code-snippet">
                            <div class="code-snippet-header">
                                ${comment.file} (${language})
                                ${adjustmentInfo}
                            </div>
                            ${snippet.lines.map(line => `
                                <div class="code-line ${line.isTarget ? 'target' : ''}">
                                    <span class="line-num">${line.lineNumber}</span>
                                    <span class="line-content">${escapeHtml(line.content)}</span>
                                </div>
                            `).join('')}
                        </div>`;
					}
				}

				return `
                <div class="comment ${label}">
                    <div class="comment-header">
                        <span class="label ${label}">${label}</span>
                        <span class="file-path">${comment.file}</span>
                        <span class="line-number">Line ${comment.line}${snippet && snippet.adjusted ? ` (showing ${snippet.targetLine})` : ''}</span>
                        ${comment._lineWarning || (snippet && snippet.adjusted) ? '<span class="line-warning" title="Line number adjusted to show relevant code context">⚠️</span>' : ''}
                    </div>
                    <div class="comment-text">${commentText}</div>
                    ${codeSnippetHtml}
                </div>`;
			}).join('')}
        </div>
    </div>
    
    <script>
        // Filter state - tracks which categories are active
        const filterState = {
            issue: true,
            suggestion: true,
            todo: true,
            question: true,
            nitpick: true,
            note: true
        };

        function toggleFilter(category) {
            // Toggle specific category
            filterState[category] = !filterState[category];
            updateDisplay();
        }

        function updateDisplay() {
            // Update stat button appearances
            Object.keys(filterState).forEach(category => {
                const statElement = document.querySelector(\`[data-filter="\${category}"]\`);
                if (statElement) {
                    statElement.classList.toggle('active', filterState[category]);
                    statElement.classList.toggle('inactive', !filterState[category]);
                }
            });

            // Update comment visibility
            const comments = document.querySelectorAll('.comment');
            comments.forEach(comment => {
                // Extract all categories this comment belongs to
                const commentCategories = [];
                
                // Get primary category from comment class
                const classList = Array.from(comment.classList);
                const primaryCategory = classList.find(cls => cls !== 'comment' && cls !== 'hidden');
                if (primaryCategory) {
                    commentCategories.push(primaryCategory);
                }
                
                // Get category from label
                const label = comment.querySelector('.label');
                if (label) {
                    const labelCategory = Array.from(label.classList).find(cls => cls !== 'label');
                    if (labelCategory && !commentCategories.includes(labelCategory)) {
                        commentCategories.push(labelCategory);
                    }
                }
                
                // Show comment if ANY of its categories are active
                const shouldShow = commentCategories.some(cat => filterState[cat]);
                
                comment.classList.toggle('hidden', !shouldShow);
            });
        }

        // Initialize display on page load
        document.addEventListener('DOMContentLoaded', updateDisplay);
    </script>
</body>
</html>`;
	return html;
}

export function outputCliFormat(parsedReview, llmChoice) {
	const stats = getReviewStatistics(parsedReview),

		// Group comments by file for ESLint-style output
		commentsByFile = new Map();
	for (const comment of parsedReview.comments) {
		if (!commentsByFile.has(comment.file)) {
			commentsByFile.set(comment.file, []);
		}
		commentsByFile.get(comment.file).push(comment);
	}

	// Color mapping for different comment types (matching HTML colors)
	const getCommentColor = (label) => {
		switch (label.toLowerCase()) {
			case 'issue': { return chalk.red;
			}
			case 'suggestion': { return chalk.blue;
			}
			case 'todo': { return chalk.yellow;
			}
			case 'question': { return chalk.magenta;
			}
			case 'nitpick': { return chalk.gray;
			}
			case 'note': { return chalk.cyan;
			}
			default: { return chalk.white;
			}
		}
	};

	console.log(`\n${chalk.bold(llmChoice.toUpperCase())} Code Review Results:\n`);
	console.log(parsedReview.summary);
	console.log('');

	if (parsedReview.comments.length === 0) {
		console.log(chalk.green('✓ No issues found.'));
		return;
	}

	// Output in ESLint style: filename followed by line-by-line issues
	for (const [fileName, comments] of commentsByFile) {
		console.log(chalk.underline(fileName));

		// Sort comments by line number
		comments.sort((a, b) => (a.line || 0) - (b.line || 0));

		for (const comment of comments) {
			const labelMatch = comment.comment.match(/^(\w+)(\s*\([^)]+\))?:/),
				label = labelMatch ? labelMatch[1] : 'note',
				commentText = comment.comment.replace(/^(\w+)(\s*\([^)]+\))?:\s*/, ''),
				colorFunction = getCommentColor(label);

			console.log(`  ${chalk.dim(comment.line || '?')}  ${colorFunction(label)}  ${commentText}`);
		}
		console.log('');
	}

	const problemText = stats.issueCount > 0 ?
		chalk.red(`✖ ${stats.totalComments} problems (${stats.issueCount} errors, ${stats.suggestions} warnings)`) :
		chalk.yellow(`⚠ ${stats.totalComments} warnings`);

	console.log(problemText);
	console.log('');
}

export async function outputToGitLab(parsedReview, llmChoice, gitlabUrl, projectId, mergeRequestIid, baseSha, startSha, headSha) {
	console.log(`\n--- ${llmChoice.toUpperCase()} Code Review Summary ---\n`);
	console.log(parsedReview.summary);

	console.log(`\nPosting ${parsedReview.comments.length} comments to Merge Request...`);
	let successfulComments = 0,
		failedComments = 0;

	for (const comment of parsedReview.comments) {
		try {
			await postLineCommentToMergeRequest(
				gitlabUrl,
				projectId,
				mergeRequestIid,
				comment.comment,
				comment.file,
				comment.line,
				baseSha,
				startSha,
				headSha,
			);
			console.log(`✓ Posted comment to ${comment.file}:${comment.line}`);
			successfulComments++;
		} catch (commentError) {
			console.error(
				`✗ Failed to post comment to ${comment.file}:${comment.line}:`,
				commentError.message,
			);
			failedComments++;
		}
	}

	console.log(`Comment posting complete: ${successfulComments} successful, ${failedComments} failed`);

	console.log('Posting summary comment...');
	await postCommentToMergeRequest(
		gitlabUrl,
		projectId,
		mergeRequestIid,
		`## ${llmChoice.toUpperCase()} Code Review Summary\n\n${parsedReview.summary}`,
	);
	console.log('✓ Summary comment posted successfully.');
}

export async function handleOutput(outputFormat, parsedReview, llmChoice, gitlabParameters = null, fileContext = null) {
	switch (outputFormat) {
		case 'html': {
			const html = generateHtmlReport(parsedReview, llmChoice, fileContext),
				fileName = `code-review-${Date.now()}.html`;
			writeFileSync(fileName, html);
			console.log(`\n✓ HTML report generated: ${fileName}`);
			console.log(`\nSummary: ${parsedReview.comments.length} comments found`);
			break;
		}
		case 'cli': {
			outputCliFormat(parsedReview, llmChoice);
			break;
		}
		case 'gitlab': {
			if (!gitlabParameters) {
				throw new Error('GitLab parameters required for GitLab output. Use --output html or --output cli for local reviews.');
			}
			await outputToGitLab(
				parsedReview,
				llmChoice,
				gitlabParameters.gitlabUrl,
				gitlabParameters.projectId,
				gitlabParameters.mergeRequestIid,
				gitlabParameters.baseSha,
				gitlabParameters.startSha,
				gitlabParameters.headSha,
			);
			break;
		}
		default: {
			throw new Error(`Unsupported output format: ${outputFormat}`);
		}
	}
}
