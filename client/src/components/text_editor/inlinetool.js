class RedTextInlineTool {
    static get isInline() {
      return true;
    }
  
    static get title() {
      return 'Red Text';
    }
  
    static get sanitize() {
      return {
        span: {
          class: 'cdx-red-text',
        },
      };
    }
  
    render() {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = 'In';
      button.classList.add('cdx-red-text-button');
      return button;
    }
  
    surround(range) {
      if (range) {
        const selectedText = range.extractContents();
        const span = document.createElement('span');
        span.classList.add('cdx-red-text');
        span.appendChild(selectedText);
        range.insertNode(span);
      }
    }
  
    checkState(selection) {
      const text = selection.anchorNode.parentElement;
      return text.classList.contains('cdx-red-text');
    }
  
    clear() {
      const button = document.querySelector('.cdx-red-text-button');
      if (button) {
        button.remove();
      }
    }
  }
  
  export default RedTextInlineTool;