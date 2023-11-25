import {apiKey,domain} from "./api.js"; 
const addTaskForm = document.getElementById("add-task-form");
const list = document.getElementById("list");

document.addEventListener("DOMContentLoaded", getAllTasks);

addTaskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get input values
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  const email = document.getElementById("task-email").value;
  const dueDate = document.getElementById("task-due-date").value;
  const dueTime = document.getElementById("task-due-time").value;

  // Perform input validation
  if (!title || !description || !email || !dueDate || !dueTime) {
    alert("Please fill in all the fields.");
    return;
  }

  // Combine date and time into a single Date object
  const dateTimeString = `${dueDate}T${dueTime}`;
  const dueDateTime = new Date(dateTimeString);

  const taskData = {
    title,
    description,
    email,
    dueDate: dueDateTime,
  };

  // Continue processing the task data, e.g., saving to a database or scheduling notifications.
  try {
    const response = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (response.status === 201) {
      console.log("Task created successfully.");
      reloadPage();
    } else {
      console.error("Error creating task.");
    }
  } catch (error) {
    console.error("Network error:", error);
  }

  // Clear the form
  addTaskForm.reset();
});

// Perform a GET request to retrieve all tasks
async function getAllTasks() {
  try {
    const response = await fetch("http://localhost:3000/api/tasks");
    if (response.status === 200) {
      const tasks = await response.json();
      console.log("All tasks:", tasks);
      tasks.forEach((task) => {
        const dateTime = dateFormat(task.dueDate);

        const li = document.createElement("li");
        li.innerHTML = `
                <div class="head"><h3>${task.title}</h3><button class="delete-button"><img src="./trash.svg" alt="" ></button></div>
                <div class="date-email"><p>Due Date: ${dateTime}</p>
                <p>${task.email}</p></div>
                <p>${task.description}</p>
    `;

        li.dataset.id = task._id;

        list.appendChild(li);
        const data = {email:task.email, title:task.title, description:task.description}
        const checkInterval = setInterval(function () {
          checkTimeAndDisplayAlert(dateTime, task._id, checkInterval, data);
      }, 1000);

      });
    } else {
      console.error("Error retrieving tasks:", response.statusText);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
}

list.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-button")) {
    const element = e.target.parentNode.parentNode;
    const id = element.dataset.id; // Accessing the "data-id" attribute
    console.log("Clicked ID:", id); // Log the ID to check its value
    deleteTask(id);
    removeTaskFromUI(id);
  }
});

// Perform a DELETE request to remove a upcoming task from the list
async function deleteTask(taskId) {
  console.log(taskId)
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    console.log("Delete Task Response:", response.status);

    if (response.status === 200) {
      console.log("Task deleted successfully.");
      // You can update the UI or take further actions as needed.
    } else if (response.status === 404) {
      console.error("Task not found.");
    } else {
      console.error("Error deleting task:", response.statusText);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
}

function removeTaskFromUI(taskId) {
  function removeTaskFromUI(taskId) {
    const taskElement = document.querySelector(`[data-id="${taskId}"]`);
    if (taskElement) {
      taskElement.remove();
      console.log(`Task with ID ${taskId} removed from the UI.`);
    } else {
      console.log(`Task with ID ${taskId} not found in the UI.`);
    }
  }
  
}

function reloadPage() {
  window.location.reload();
}

function dateFormat(inputDate){

// Parse the input date string to create a Date object
const date = new Date(inputDate);

// Format the date and time components
const year = date.getFullYear();
const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
const day = date.getDate().toString().padStart(2, '0');
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');

// Create the formatted date and time string
const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

return formattedDate;
}

function checkTimeAndDisplayAlert(dueTime, id, checkInterval, data) {
  const currentDateTime = new Date();
  const dueDateTime = new Date(dueTime);
  const {email, title, description} = data;
  if (currentDateTime >= dueDateTime) {
      // The due time has been reached
      alert('The task is due now!');
      sendMail(email, title, description);
      clearInterval(checkInterval);
      deleteTask(id);
      removeTaskFromUI(id);
  }
}



const url = `https://api.mailgun.net/v3/${domain}/messages`;

function sendMail(email, title, description){
  const formData = new FormData();
formData.append('from', 'Excited User <mailgun@' + domain + '>');
formData.append('to', email);
formData.append('subject', title);
formData.append('text', description);

fetch(url, {
  method: 'POST',
  headers: {
    Authorization: 'Basic ' + btoa('api:' + apiKey),
  },
  body: formData,
})
  .then((response) => response.json())
  .then((data) => {
    console.log('Email sent:', data);
  })
  .catch((error) => {
    console.error('Error sending email:', error);
  });
}