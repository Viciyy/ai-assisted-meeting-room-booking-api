const fs = require('fs');
const path = require('path');

/**
 * Parses PROMPTIT.json and creates a human-readable markdown file
 */

const inputPath = path.join(__dirname, '..', 'PROMPTIT.json');
const outputPath = path.join(__dirname, '..', 'PROMPTIT.md');

// Read and parse the JSON file
const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

let markdown = '';

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

      const thinkingBlocks = [];
      const toolInvocations = [];
      const textEdits = [];
      const markdownContent = [];

      request.response.forEach(item => {
        switch (item.kind) {
          case 'thinking':
            if (item.value && item.value.trim()) {
              thinkingBlocks.push(item.value.trim());
            }
            break;

          case 'toolInvocationSerialized':
            if (item.pastTenseMessage && item.pastTenseMessage.value) {
              // Extract file path from the message
              const match = item.pastTenseMessage.value.match(/file:\/\/\/([^)"\s]+)/);
              if (match) {
                const filePath = decodeURIComponent(match[1]).replace(/\//g, '\\');
                const action = item.pastTenseMessage.value.includes('Created') ? 'Created' : 
                              item.pastTenseMessage.value.includes('Edited') ? 'Edited' : 'Modified';
                toolInvocations.push({ action, filePath, toolId: item.toolId });
              }
            }
            break;

          case 'textEditGroup':
            if (item.uri && item.uri.path) {
              const filePath = item.uri.path.replace(/^\//, '').replace(/\//g, '\\');
              // Collect all text edits for this file
              if (item.edits && Array.isArray(item.edits)) {
                const content = item.edits
                  .flat()
                  .filter(edit => edit && edit.text)
                  .map(edit => edit.text)
                  .join('');
                if (content.trim()) {
                  textEdits.push({ filePath, content: content.trim() });
                }
              }
            }
            break;

          case 'markdownContent':
            if (item.content && item.content.value) {
              markdownContent.push(item.content.value);
            }
            break;
        }
      });

      // Display thinking process
      if (thinkingBlocks.length > 0) {
        markdown += '#### 💭 Thinking\n\n';
        thinkingBlocks.forEach(thought => {
          markdown += `> ${thought.replace(/\n/g, '\n> ')}\n\n`;
        });
      }

      // Display tool invocations / file operations
      if (toolInvocations.length > 0) {
        markdown += '#### 🔧 Actions\n\n';
        toolInvocations.forEach(inv => {
          markdown += `- **${inv.action}**: \`${inv.filePath}\`\n`;
        });
        markdown += '\n';
      }

      // Display file contents created/edited
      if (textEdits.length > 0) {
        markdown += '#### 📄 Files Created/Modified\n\n';
        textEdits.forEach(edit => {
          const ext = path.extname(edit.filePath).slice(1) || 'text';
          const langMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'json': 'json',
            'md': 'markdown',
            'py': 'python',
            'html': 'html',
            'css': 'css'
          };
          const lang = langMap[ext] || ext;
          
          markdown += `**${edit.filePath}**\n\n`;
          markdown += '```' + lang + '\n';
          markdown += edit.content + '\n';
          markdown += '```\n\n';
        });
      }

      // Display markdown responses
      if (markdownContent.length > 0) {
        markdown += '#### 📝 Response\n\n';
        markdownContent.forEach(content => {
          markdown += content + '\n\n';
        });
      }
    }

    markdown += '---\n\n';
  });
}

// Write the markdown file
fs.writeFileSync(outputPath, markdown, 'utf-8');

console.log(`✅ Successfully created ${outputPath}`);
console.log(`   Processed ${data.requests ? data.requests.length : 0} exchanges`);
