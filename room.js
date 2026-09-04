const DabsyRoom = {
  render() {
    const tasks = MemorySystem.get('tasks');
    const projects = MemorySystem.get('projects');
    const profile = MemorySystem.get('profile');

    return `
      <div class="room-container">
        <div class="room-header">
          <h2>D.A.B.S.y's World</h2>
          <button id="close-room" class="hud-btn">&times;</button>
        </div>
        <div class="room-tabs">
          <button class="tab-btn active" data-tab="environment">🏠 Room</button>
          <button class="tab-btn" data-tab="tasks">✅ Tasks</button>
          <button class="tab-btn" data-tab="projects">🗂️ Projects</button>
          <button class="tab-btn" data-tab="study">📚 Study</button>
          <button class="tab-btn" data-tab="memory">🧠 Memory</button>
        </div>
        <div class="room-content">
          <div id="tab-environment" class="tab-pane active">
            <div class="environment-view">
              <div class="env-item desk">🪵 Desk & Lamp</div>
              <div class="env-item plants">🌿 Study Plant (Streak: ${profile.streak})</div>
              <div class="env-item window">🪟 Window View</div>
            </div>
          </div>
          <div id="tab-tasks" class="tab-pane">
            <div class="task-list">
              ${tasks.length === 0 ? '<p class="empty">No pending tasks.</p>' : tasks.map(t => `
                <div class="task-card ${t.completed ? 'done' : ''}">
                  <span>${t.name}</span>
                  <button onclick="DabsyApp.completeTask(${t.id})">${t.completed ? 'Done' : 'Complete'}</button>
                </div>
              `).join('')}
            </div>
            <div class="task-input-row">
              <input type="text" id="new-task-input" placeholder="New task...">
              <button id="add-task-btn" class="hud-btn primary">Add</button>
            </div>
          </div>
          <div id="tab-projects" class="tab-pane">
            <div class="project-list">
              ${projects.length === 0 ? '<p class="empty">No active projects.</p>' : projects.map(p => `
                <div class="project-card">
                  <h4>${p.name}</h4>
                  <small>Created: ${new Date(p.createdAt).toLocaleDateString()}</small>
                </div>
              `).join('')}
            </div>
          </div>
          <div id="tab-study" class="tab-pane">
            <button id="start-tutor-btn" class="hud-btn primary">Start Adaptive Socratic Tutor</button>
            <div id="tutor-chat" class="tutor-chat"></div>
          </div>
          <div id="tab-memory" class="tab-pane">
            <textarea id="memory-inspector" readonly>${MemorySystem.export()}</textarea>
          </div>
        </div>
      </div>
    `;
  }
};

