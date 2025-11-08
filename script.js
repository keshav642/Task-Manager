
        var tasks = [];
        var taskIdCounter = 0;
        var activeInputId = null;

        function showMainTaskInput() {
            if (activeInputId === 'main') return;
            
            activeInputId = 'main';
            var html = '<div class="task-input-container">' +
                '<input type="text" class="task-input" id="mainTaskInput" placeholder="Enter Task Name..." autofocus />' +
                '<button class="create-btn" onclick="createMainTask()">Create Task</button>' +
                '<button class="cancel-btn" onclick="cancelMainTaskInput()">Cancel</button>' +
                '</div>';
            
            document.getElementById('mainInputContainer').innerHTML = html;
            
            document.getElementById('mainTaskInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') createMainTask();
            });
        }

        function cancelMainTaskInput() {
            activeInputId = null;
            document.getElementById('mainInputContainer').innerHTML = '';
        }

        function createMainTask() {
            var input = document.getElementById('mainTaskInput');
            var text = input.value.trim();
            
            if (text === '') {
                alert('Enter Task Name');
                return;
            }

            var task = {
                id: taskIdCounter++,
                text: text,
                completed: false,
                children: [],
                showInput: false
            };
            
            tasks.push(task);
            activeInputId = null;
            document.getElementById('mainInputContainer').innerHTML = '';
            render();
        }

        function showChildInput(taskId) {
            if (activeInputId === taskId) return;
            
            activeInputId = taskId;
            
            function updateShowInput(taskList) {
                for (var i = 0; i < taskList.length; i++) {
                    var task = taskList[i];
                    task.showInput = (task.id === taskId);
                    if (task.children.length > 0) {
                        updateShowInput(task.children);
                    }
                }
            }
            
            updateShowInput(tasks);
            render();
            
            setTimeout(function() {
                var input = document.getElementById('childInput-' + taskId);
                if (input) input.focus();
            }, 100);
        }

        function createChildTask(parentId) {
            var input = document.getElementById('childInput-' + parentId);
            var text = input.value.trim();
            
            if (text === '') {
                alert('Enter Task Name');
                return;
            }

            function findAndAddChild(taskList) {
                for (var i = 0; i < taskList.length; i++) {
                    var task = taskList[i];
                    if (task.id === parentId) {
                        var childTask = {
                            id: taskIdCounter++,
                            text: text,
                            completed: false,
                            children: [],
                            showInput: false
                        };
                        task.children.push(childTask);
                        task.showInput = false;
                        return true;
                    }
                    if (task.children.length > 0) {
                        if (findAndAddChild(task.children)) return true;
                    }
                }
                return false;
            }
            
            findAndAddChild(tasks);
            activeInputId = null;
            render();
        }

        function cancelChildInput(taskId) {
            function updateShowInput(taskList) {
                for (var i = 0; i < taskList.length; i++) {
                    var task = taskList[i];
                    if (task.id === taskId) {
                        task.showInput = false;
                    }
                    if (task.children.length > 0) {
                        updateShowInput(task.children);
                    }
                }
            }
            
            updateShowInput(tasks);
            activeInputId = null;
            render();
        }

        function toggleTask(taskId) {
            function findAndToggle(taskList) {
                for (var i = 0; i < taskList.length; i++) {
                    var task = taskList[i];
                    if (task.id === taskId) {
                        task.completed = !task.completed;
                        toggleAllChildren(task, task.completed);
                        return true;
                    }
                    if (task.children.length > 0) {
                        if (findAndToggle(task.children)) return true;
                    }
                }
                return false;
            }
            
            function toggleAllChildren(task, completed) {
                for (var i = 0; i < task.children.length; i++) {
                    var child = task.children[i];
                    child.completed = completed;
                    toggleAllChildren(child, completed);
                }
            }
            
            findAndToggle(tasks);
            render();
        }

        function deleteTaskById(taskId) {
            function findAndDelete(taskList) {
                for (var i = 0; i < taskList.length; i++) {
                    if (taskList[i].id === taskId) {
                        taskList.splice(i, 1);
                        return true;
                    }
                    if (taskList[i].children.length > 0) {
                        if (findAndDelete(taskList[i].children)) return true;
                    }
                }
                return false;
            }
            
            findAndDelete(tasks);
            render();
        }

        function updateTaskText(taskId, newText) {
            function findAndUpdate(taskList) {
                for (var i = 0; i < taskList.length; i++) {
                    var task = taskList[i];
                    if (task.id === taskId) {
                        task.text = newText;
                        return true;
                    }
                    if (task.children.length > 0) {
                        if (findAndUpdate(task.children)) return true;
                    }
                }
                return false;
            }
            findAndUpdate(tasks);
        }

        function renderTask(task, level) {
            if (level === undefined) level = 0;
            
            var levelColors = ['#667eea', '#4CAF50', '#ff9800', '#e91e63', '#9c27b0'];
            var borderColor = levelColors[level % levelColors.length];
            
            var html = '<li class="task-item">';
            html += '<div class="task-content ' + (task.completed ? 'completed' : '') + '" style="border-left-color: ' + borderColor + '">';
            html += '<input type="checkbox" class="task-checkbox" ' + (task.completed ? 'checked' : '') + ' onchange="toggleTask(' + task.id + ')" />';
            html += '<input type="text" class="task-text ' + (task.completed ? 'completed' : '') + '" value="' + task.text + '" onchange="updateTaskText(' + task.id + ', this.value)" placeholder="Task name..." />';
            html += '<button class="btn add-child-btn" onclick="showChildInput(' + task.id + ')" title="Sub-task add karo">Add Task</button>';
            html += '<button class="btn delete-btn" onclick="deleteTaskById(' + task.id + ')" title="Delete karo">Delete</button>';
            html += '</div>';
            
            if (task.showInput) {
                html += '<div class="task-input-container" style="margin-left: 40px;">';
                html += '<input type="text" class="task-input" id="childInput-' + task.id + '" placeholder="Enter Sub Task..." onkeypress="if(event.key === \'Enter\') createChildTask(' + task.id + ')" />';
                html += '<button class="create-btn" onclick="createChildTask(' + task.id + ')">Create Task</button>';
                html += '<button class="cancel-btn" onclick="cancelChildInput(' + task.id + ')">Cancel</button>';
                html += '</div>';
            }
            
            if (task.children.length > 0) {
                html += '<ul class="subtasks">';
                for (var i = 0; i < task.children.length; i++) {
                    html += renderTask(task.children[i], level + 1);
                }
                html += '</ul>';
            }
            
            html += '</li>';
            return html;
        }

        function render() {
            var container = document.getElementById('taskContainer');
            
            if (tasks.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>Empty Task</p></div>';
                return;
            }

            var html = '<ul class="task-list">';
            for (var i = 0; i < tasks.length; i++) {
                html += renderTask(tasks[i], 0);
            }
            html += '</ul>';
            
            container.innerHTML = html;
        }

        render();
   