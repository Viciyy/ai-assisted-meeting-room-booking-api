const fs = require('fs');
const path = require('path');

/**
 * Parses PROMPTIT.json and creates a comprehensive human-readable markdown file
 */

const inputPath = path.join(__dirname, '..', 'PROMPTIT.json');
const outputPath = path.join(__dirname, '..', 'PROMPTIT.md');

// Read and parse the JSON file
const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

let markdown = '';

// Helper: escape code fences in content
function getCodeFence(content) {
  let backticks = '```';
  while (content.includes(backticks)) {
    backticks += '`';
  }
  return backticks;
}

// Helper: get language for file extension
function getLangForExt(filePath) {
  const ext = path.extname(filePath).slice(1) || 'text';
  const langMap = {
    'js': 'javascript',
    'ts': 'typescript',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'sh': 'bash',
    'bash': 'bash',
    'ps1': 'powershell',
    'pwsh': 'powershell'
  };
  return langMap[ext] || ext;
}

// Helper: clean terminal ANSI codes
function cleanAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

// Helper: extract file path from URI or message
function extractFilePath(item) {
  if (item.uri && item.uri.path) {
    return item.uri.path.replace(/^\//, '').replace(/\//g, '\\');
  }
  if (item.pastTenseMessage) {
    const msg = typeof item.pastTenseMessage === 'string' ? item.pastTenseMessage : item.pastTenseMessage.value;
    if (msg) {
      const match = msg.match(/file:\/\/\/([^)"\s#]+)/);
      if (match) {
        return decodeURIComponent(match[1]).replace(/\//g, '\\');
      }
    }
  }
  return null;
}

// Header
markdown += '# Chat History\n\n';
markdown += `**Assistant:** ${data.responderUsername || 'Unknown'}\n\n`;
markdown += '---\n\n';

// Process each request in the conversation
if (data.requests && Array.isArray(data.requests)) {
  data.requests.forEach((request, index) => {
    markdown += `## Exchange ${index + 1}\n\n`;

    // User message
    if (request.message) {
      markdown += '### 👤 User\n\n';
      const userText = request.message.text || '';
      markdown += userText.trim() + '\n\n';
    }

    // Assistant response
    if (request.response && Array.isArray(request.response)) {
      markdown += '### 🤖 Assistant\n\n';

      // Collect all content in order
      const sections = {
        thinking: [],
        actions: [],
        fileEdits: [],
        terminalOutputs: [],
        responseText: []
      };

      request.response.forEach(item => {
        // Thinking blocks
        if (item.kind === 'thinking' && item.value && item.value.trim()) {
          sections.thinking.push(item.value.trim());
        }
        
        // Tool invocations (file operations, terminal commands)
        else if (item.kind === 'toolInvocationSerialized') {
          const toolId = item.toolId || '';
          const filePath = extractFilePath(item);
          
          // File operations
          if (filePath && (toolId.includes('createFile') || toolId.includes('editFile') || toolId.includes('replace'))) {
            const pastMsg = typeof item.pastTenseMessage === 'string' ? item.pastTenseMessage : item.pastTenseMessage?.value || '';
            const action = pastMsg.includes('Created') ? 'Created' : 
                          pastMsg.includes('Edited') ? 'Edited' : 
                          pastMsg.includes('Read') ? 'Read' : 'Modified';
            if (action !== 'Read') {
              sections.actions.push({ action, filePath, toolId });
            }
          }
          
          // Terminal commands
          if (item.toolSpecificData && item.toolSpecificData.kind === 'terminal') {
            const termData = item.toolSpecificData;
            const cmd = termData.commandLine?.original || '';
            const output = termData.terminalCommandOutput?.text || '';
            const exitCode = termData.terminalCommandState?.exitCode;
            
            if (cmd) {
              sections.terminalOutputs.push({
                command: cmd,
                output: cleanAnsi(output),
                exitCode
              });
            }
          }
        }
        
        // Text edits (file contents)
        else if (item.kind === 'textEditGroup' && item.uri && item.uri.path) {
          const filePath = item.uri.path.replace(/^\//, '').replace(/\//g, '\\');
          if (item.edits && Array.isArray(item.edits)) {
            const content = item.edits
              .flat()
              .filter(edit => edit && edit.text)
              .map(edit => edit.text)
              .join('');
            if (content.trim()) {
              sections.fileEdits.push({ filePath, content: content.trim() });
            }
          }
        }
        
        // Inline references (file links in response)
        else if (item.kind === 'inlineReference') {
          const name = item.name || (item.inlineReference?.path?.split('/').pop()) || '';
          if (name) {
            sections.responseText.push(`[${name}]`);
          }
        }
        
        // Plain text/value responses (markdown content from assistant)
        else if (item.value && typeof item.value === 'string') {
          sections.responseText.push(item.value);
        }
        
        // Markdown content blocks
        else if (item.kind === 'markdownContent' && item.content && item.content.value) {
          sections.responseText.push(item.content.value);
        }
      });

      // Render thinking
      if (sections.thinking.length > 0) {
        markdown += '#### 💭 Thinking\n\n';
        sections.thinking.forEach(thought => {
          markdown += `> ${thought.replace(/\n/g, '\n> ')}\n\n`;
        });
      }

      // Render actions (file operations)
      if (sections.actions.length > 0) {
        markdown += '#### 🔧 File Operations\n\n';
        sections.actions.forEach(inv => {
          markdown += `- **${inv.action}**: \`${inv.filePath}\`\n`;
        });
        markdown += '\n';
      }

      // Render file contents
      if (sections.fileEdits.length > 0) {
        markdown += '#### 📄 Files Created/Modified\n\n';
        sections.fileEdits.forEach(edit => {
          const lang = getLangForExt(edit.filePath);
          const fence = getCodeFence(edit.content);
          
          markdown += `**${edit.filePath}**\n\n`;
          markdown += fence + lang + '\n';
          markdown += edit.content + '\n';
          markdown += fence + '\n\n';
        });
      }

      // Render terminal outputs
      if (sections.terminalOutputs.length > 0) {
        markdown += '#### 💻 Terminal Commands\n\n';
        sections.terminalOutputs.forEach(term => {
          markdown += `**Command:** \`${term.command}\`\n`;
          if (term.exitCode !== undefined) {
            markdown += `**Exit Code:** ${term.exitCode}\n`;
          }
          if (term.output.trim()) {
            const fence = getCodeFence(term.output);
            markdown += '\n' + fence + '\n';
            markdown += term.output.trim() + '\n';
            markdown += fence + '\n';
          }
          markdown += '\n';
        });
      }

      // Render response text
      const fullResponse = sections.responseText.join('').trim();
      if (fullResponse) {
        markdown += '#### 📝 Response\n\n';
        // Clean up potential broken code blocks from inline backtick sequences
        // Remove standalone lines that are just backticks (empty code blocks)
        const cleanedResponse = fullResponse
          .replace(/```\s*\n\s*```/g, '') // Remove empty code blocks
          .replace(/\n```\s*$/gm, '') // Remove trailing orphan code fences
          .replace(/^```\s*\n/gm, ''); // Remove leading orphan code fences
        markdown += cleanedResponse + '\n\n';
      }
    }

    markdown += '---\n\n';
  });
}

// Write the markdown file
fs.writeFileSync(outputPath, markdown, 'utf-8');

console.log(`✅ Successfully created ${outputPath}`);
console.log(`   Processed ${data.requests ? data.requests.length : 0} exchanges`);
