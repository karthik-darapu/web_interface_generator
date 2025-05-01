async function generateCode() {
  const prompt = document.getElementById('prompt').value;
  const generatedCodeElem = document.getElementById('generatedCode');
  const previewFrame = document.getElementById('previewFrame');
  const codePreviewContainer = document.getElementById('code-preview-container');

  generatedCodeElem.textContent = "Generating...";
  if (codePreviewContainer) {
    codePreviewContainer.style.display = 'none';
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt })
    });

    const result = await response.json();
    const fullCode = result.code;

    generatedCodeElem.textContent = fullCode;

    // Create a temporary div to parse the fullCode
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullCode;

    // Extract HTML (everything that's not style or script)
    const htmlElements = tempDiv.querySelectorAll(':scope > *:not(style):not(script)');
    let extractedHTML = '';
    htmlElements.forEach(element => {
      extractedHTML += element.outerHTML;
    });

    // Extract CSS
    const styleTags = tempDiv.querySelectorAll('style');
    let extractedCSS = '';
    styleTags.forEach(style => {
      extractedCSS += style.textContent;
});
    const linkTags = tempDiv.querySelectorAll('link[rel="stylesheet"]');
    linkTags.forEach(link => link.remove());


    // Extract JavaScript
    const scriptTags = tempDiv.querySelectorAll('script');
    let extractedJS = '';
    scriptTags.forEach(script => {
      extractedJS += script.textContent;
    });

    // Replace your current iframe document writing code with this:
const iframeDoc = previewFrame.contentWindow.document;
iframeDoc.open();
iframeDoc.write(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
      ${extractedCSS}
    </style>
  </head>
  <body>
    ${extractedHTML}
    <script type="text/javascript">
      ${extractedJS.replace(/<\/script>/g, '<\\/script>')}
    </script>
  </body>
  </html>
`);
iframeDoc.close();

// After writing to the iframe, you can also try forcing a style refresh:
setTimeout(() => {
  const styleElement = iframeDoc.createElement('style');
  styleElement.textContent = extractedCSS;
  iframeDoc.head.appendChild(styleElement);
}, 100);

    if (codePreviewContainer) {
      codePreviewContainer.style.display = 'grid';
    }

  } catch (error) {
    console.error("Error generating code:", error);
    generatedCodeElem.textContent = "Error generating code.";
  }
}

function copyCode() {
  const codeToCopy = document.getElementById('generatedCode');
  if (codeToCopy) {
    navigator.clipboard.writeText(codeToCopy.textContent)
      .then(() => {
        alert('Code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
        alert('Failed to copy code.');
      });
  }
}

const textarea = document.getElementById('prompt');
textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
});