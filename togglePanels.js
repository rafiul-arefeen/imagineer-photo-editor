const generalButton = document.querySelector('.general-panel');
const aiButton = document.querySelector('.ai-panel');

const editorPanelContent = document.querySelector('.editor-panel-content');

generalButton.addEventListener('click', () => {
    generalButton.classList.add('active');
    aiButton.classList.remove('active');
    editorPanelContent.dataset.activePanel = 'general';
    showGeneralPanel();
});

aiButton.addEventListener('click', () => {
    generalButton.classList.remove('active');
    aiButton.classList.add('active');
    editorPanelContent.dataset.activePanel = 'ai';
    hideGeneralPanel();
});

function showGeneralPanel() {
    const editorPanel = document.querySelector('.editor-panel');
    editorPanel.style.display = 'block';
}

function hideGeneralPanel() {
    const editorPanel = document.querySelector('.editor-panel');
    editorPanel.style.display = 'none';
}