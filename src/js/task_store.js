const TaskStore = (function()
{
    const KEY = 'tasks';
        
    function save(tasks)
    { localStorage.setItem(KEY, JSON.stringify(tasks)) }

    function getAll()
    { return JSON.parse(localStorage.getItem(KEY) || '[]'); }

    function add(mdString)
    {
        const id = Date.now();
        const mdWithId = mdString.replace(`---\n`, `---\nid: ${id}\n`);

        const tasks = getAll();
        tasks.push(mdWithId);
        save(tasks);

        return id;
    }

    function remove(id)
    {
        const tasks = getAll();
        const filtered = tasks.filter(task => !task.includes(`id: ${id}`));

        save(filtered);
    }

    function update(id, mdString)
    {
        const tasks = getAll();
        const updated = tasks.map(task => 
        {
            if (task.includes(`id: ${id}`)) return mdString;
            return task;
        });
        
        save(updated);
    }

    return { getAll: getAll, add: add, remove: remove, update: update };
})();