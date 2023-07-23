function showDivisionsWithDelay() {
    const cardDivisions = document.querySelectorAll('.card');
    const delay = 300; 

    cardDivisions.forEach((card, index) => {
        setTimeout(() => {
        card.style.opacity = 1;
        }, (index + 1) * delay);
    });
    }
    
document.addEventListener("DOMContentLoaded", () => {
    const taskContainer = document.getElementById("TaskContainer");
    const addButton = document.querySelector(".bx-plus");
    const textInput = document.getElementById("todo");
    const dateInput = document.getElementById("duedate");
    const myDayLink = document.getElementById("o1");
    const thisWeekLink = document.getElementById("o2");
    const thisMonthLink = document.getElementById("o3");
    const otherLink = document.getElementById("o4");
    const titleLink = document.getElementById("header_title");
    

    // const taskList = document.getElementById("taskList");

    // Function to generate a unique numeric ID
    const generateNumericID = () => {
        return Date.now() + Math.floor(Math.random() * 1000);
    };

    // Function to handle data submission
    const saveData = () => {
        const taskDescription = textInput.value;
        const dueDate = dateInput.value;

        // Check if both text and date are entered before saving
        if (taskDescription.trim() === "" || dueDate === "") {
            swal({
                title: "Error",
                text: "Please enter both task and due date!",
                icon: "error",
            });
        }else{
            // Generate a unique numeric ID
            const id = generateNumericID();

            // Create a new object representing the to-do task
            const task = {
            id: id,
            text: taskDescription,
            date: dueDate,
            completed: false,
            timestamp: Date.now(), // Shortened timestamp in milliseconds
            };

            // Convert the task object to a JSON string
            const taskData = JSON.stringify(task);

            // Save the JSON data to LocalStorage with the unique ID as the key
            localStorage.setItem(id, taskData);

            // Clear the text and date inputs after saving
            textInput.value = "";
            dateInput.value = "";
            displayTasks(currentSection);
        }
    };

    addButton.addEventListener("click", saveData);

    // Add keypress event listener to the text input and date input
    textInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
        saveData();
        }
    });

    dateInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
        saveData();
        }
    });

    
    // Function to check if a date is today
    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
        };
    // Function to retrieve tasks from LocalStorage and display them
    const displayTasks = (section, tasksToDisplay) => {
        currentSection = section;
        const tasksData = Object.values(localStorage);
        const tasks = tasksData.map(taskData => JSON.parse(taskData));
        const tasksToRender = tasksToDisplay || tasks;
        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        const todayDate = new Date().toLocaleDateString('en-CA');


        // Filter tasks based on the selected section
        const filteredTasks = tasksToRender.filter(task => {
            switch (section) {
            case "myDay":
                titleLink.textContent = "My Day";
                return task.date === todayDate;
            case "thisWeek":
                titleLink.textContent = "Current Week";
                const getStartOfWeek = (date) => {
                    const day = date.getDay();
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
                  };
                  
                  const getEndOfWeek = (date) => {
                    const day = date.getDay();
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - day));
                  };
                  
                  const today = new Date();
                  const startOfWeek = getStartOfWeek(today);
                  const endOfWeek = getEndOfWeek(today);
                  
                  const taskDate = new Date(task.date); // Convert task.date to a Date object for comparison
                  
                  return taskDate >= startOfWeek && taskDate <= endOfWeek;
            case "thisMonth":
                titleLink.textContent = "Current Month";
                const getStartOfMonth = (date) => {
                    return new Date(date.getFullYear(), date.getMonth(), 1);
                  };
                  
                  // Function to get the end date of the current month
                  const getEndOfMonth = (date) => {
                    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  };
                const startOfMonth = getStartOfMonth(new Date());
                const endOfMonth = getEndOfMonth(new Date());
                return task.date >= startOfMonth.toISOString().slice(0, 10) && task.date <= endOfMonth.toISOString().slice(0, 10);
                case "other":
                    titleLink.textContent = "All tasks";
                    return true; // Display all tasks for "Other" section
                default:
                    return false; // Hide tasks for unknown sections
            }
        });

        taskContainer.innerHTML = filteredTasks.map(task => `
          <div class="card align" data-task-id="${task.id}">
            <input type="checkbox" name="task" id="${task.id}" ${task.completed ? "checked" : ""}>
            <div ${task.completed ? 'class="marker done"' : 'class="marker"'}>
              <span>${task.text}</span>
              <p class="date ${isToday(task.date) ? "today" : ""}">${isToday(task.date) ? "Today" : "<i class='bx bx-calendar-alt'></i> " + task.date}</p>              
            </div>
            <i class="bx bx-trash-alt"></i>
          </div>
        `).join("");

        const searchInput = document.getElementById("search");

        // Function to handle the search input and filter tasks
        const handleSearch = () => {
            const searchText = searchInput.value.trim().toLowerCase();
            if (searchText !== "") {
                // Filter tasks based on the search text
                const filteredTasks = tasks.filter(task =>
                    task.text.toLowerCase().includes(searchText)
                );
                displayTasks(currentSection, filteredTasks);
            } else {
                // If the search text is empty, display all tasks
                displayTasks(currentSection);
            }
        };

            // Add keypress event listener to the search input
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                handleSearch();
            }
        });

            // Attach event listener to the parent container
        taskContainer.addEventListener('click', (event) => {
            // Handle checkbox change
            if (event.target.type === "checkbox" && event.target.name === "task") {
            const taskId = event.target.id;
            const task = tasks.find(task => task.id.toString() === taskId);
            if (task) {
                task.completed = event.target.checked;
                localStorage.setItem(task.id, JSON.stringify(task));
                const marker = event.target.nextElementSibling;
                if (marker.classList.contains("marker")) {
                marker.classList.toggle("done", task.completed);
                }
            }
            }

            // Handle delete icon click
            if (event.target.classList.contains("bx-trash-alt")) {
                const taskId = event.target.closest('.card').dataset.taskId;
                swal({
                    title: "Delete current task?",
                    text: "Once deleted, you will not be able to recover this task!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                })
                .then((willDelete) => {
                    if (willDelete) {
                        localStorage.removeItem(taskId);
                        event.target.closest('.card').remove();
                        swal("Poof! Your task has been deleted!", {
                            icon: "success",
                        });
                    }
                });
            }

        });
        showDivisionsWithDelay(); 
    };
  
    const buttonsDiv = document.querySelector(".buttons");
    buttonsDiv.addEventListener("click", () => {
      swal({
        title: "Delete all data?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
          // If user confirms, delete all entries from LocalStorage and clear the taskContainer
          localStorage.clear();
          taskContainer.innerHTML = "";
          swal("All data has been deleted!", {
            icon: "success",
          });
        } 
      });
    });

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault(); 
      window.location.href = "about:blank";
    });

    // Using API to fetch profile data
    fetch("db/data.txt").then(response => response.text()).then(data => {
      // Use regular expressions to extract name and email
      const nameRegex = /Your_name\s*=\s*"([^"]*)"/;
      const emailRegex = /Your_email\s*=\s*"([^"]*)"/;

      const nameMatch = data.match(nameRegex);
      const emailMatch = data.match(emailRegex);

      // Check if both name and email are found in the file
      if (nameMatch && emailMatch) {
        const name = nameMatch[1];
        const email = emailMatch[1];

        // Replace the placeholder elements with the retrieved values
        const nameElement = document.getElementById("name");
        const emailElement = document.getElementById("email");

        nameElement.textContent = name;
        emailElement.textContent = email;
      } else {
        console.error("Name or Email not found in the file.");
      }
    }).catch(error => console.error("Error fetching the file:", error));

    
    
    // Event listeners for section links
    myDayLink.addEventListener("click", () => displayTasks("myDay"));
    thisWeekLink.addEventListener("click", () => displayTasks("thisWeek"));
    thisMonthLink.addEventListener("click", () => displayTasks("thisMonth"));
    otherLink.addEventListener("click", () => displayTasks("other"));
    let currentSection = "myDay";
    displayTasks(currentSection);   
    

});



