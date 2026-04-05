const taskgrid = document.getElementById('task-grid');

function renderGrid()
{
    taskgrid.innerHTML = '';
    const allTasks = TaskStore.getAll(); 
    allTasks.forEach(mdString =>
    {
        const card = TaskRenderer.renderCard(mdString);
        taskgrid.appendChild(card);
    });
    
     applyLang(localStorage.getItem('lang') || 'ENG');
    taskEmptyText();
}

let todayTask = false;

function renderTodayGrid()
{
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    if (todayTask) {
        document.querySelectorAll('.task-card').forEach(card => {
            card.style.display = '';
        });
        todayTask = false;
        return;
    }

    document.querySelectorAll('.task-card').forEach(card => {
    const dueDate = card.querySelector('.time-card').value || '';
    if (dueDate !== '' && dueDate.slice(0, 10) !== todayStr) {
        card.style.display = 'none';
    }
});
todayTask = true;
}


const editor_overlay = document.getElementById('editor-overlay');
function addTaskCard() { 
        TaskEditor.open();
        editor_overlay.classList.add('active');
 }
function closeTaskCard(){
        editor_overlay.classList.remove('active');
}

document.querySelector('.overlay').addEventListener('click', (event) => {
    if (event.target !== event.currentTarget) return;
    document.querySelector('.modal-buttons').style.display = 'none';
    document.querySelector('#editor-title').style.pointerEvents = '';
    document.querySelector('#editor-time').style.pointerEvents = '';
    const area = document.querySelector('#editor-area');
    area.setAttribute('contenteditable', 'true');
    area.style.userSelect = '';
    area.style.cursor = '';
    closeTaskCard();
     setTimeout(() => {
        document.querySelector('.modal-buttons').style.display = '';
    }, 300);
});
function viewCard(id){
    const allTasks = TaskStore.getAll();
    const rawMarkdown = allTasks.find(t => t.includes(`id: ${id}`));
    if (!rawMarkdown) return;
    const parsed = TaskRenderer.parseFrontmatter(rawMarkdown);
    const lines = parsed.content.split('\n');
    const title = lines[0] ? lines[0].replace('# ', '') : '';
    const body = lines.slice(1).join('\n');
    const dueDate = parsed.metadata.dueDate || '';
    TaskEditor.open(id, title, body, dueDate); 
    editor_overlay.classList.add('active');
    document.querySelector('#editor-mode').setAttribute('data-lang', 'viewtask');
    applyLang(localStorage.getItem('lang') || 'ENG');
    document.querySelector('#editor-title').style.pointerEvents = 'none';
    document.querySelector('#editor-time').style.pointerEvents = 'none';
    const area = document.querySelector('#editor-area');
    area.setAttribute('contenteditable', 'false');
    area.style.userSelect = 'none';
    area.style.cursor = 'default';
    document.querySelector('.modal-buttons').style.display = 'none';
}

const about_div = document.querySelector('.about_div');

function addCardAbout() {
    about_div.classList.add('active');
}
function closeAbout() {
    about_div.classList.remove('active');
}

function taskEmptyText()
{
    const taskEmpty = document.querySelector('[data-task-empty]');
    if (!taskEmpty) return;

    const taskItems = document.getElementById('task-grid').querySelectorAll('[data-task]');
    
    if (taskItems.length > 0) taskEmpty.classList.add('none');
    else taskEmpty.classList.remove('none');
}

taskgrid.addEventListener('click', (event) =>
{
    const card = event.target.closest('.task-card');
    if (!card) return;
    const id = card.getAttribute('data-id');

    if (event.target.classList.contains('btn-delete'))
    {
        TaskStore.remove(id);
        card.remove();
        taskEmptyText();
        return;
    }

    if (event.target.classList.contains('btn-edit'))
    {
        
    const card = event.target.closest('.task-card');
    const id = card.getAttribute('data-id');
    const allTasks = TaskStore.getAll();
    const rawMarkdown = allTasks.find(t => t.includes(`id: ${id}`));
    if (!rawMarkdown) return;
    const parsed = TaskRenderer.parseFrontmatter(rawMarkdown);
    const lines = parsed.content.split('\n');
    const title = lines[0] ? lines[0].replace('# ', '') : '';
    const body = lines.slice(1).join('\n');
    const dueDate = parsed.metadata.dueDate || '';
    
    TaskEditor.open(id, title, body, dueDate); 
    editor_overlay.classList.add('active');
        return; 
    }

    if(event.target.classList.contains('checkbox-card')||
        event.target.classList.contains('time-card')){return;}
    viewCard(id);
});

renderGrid();